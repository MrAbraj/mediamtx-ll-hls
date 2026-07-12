type ConnectionState = "running" | "closed" | "restarting";

interface Conf {
  url: string;
  stream: MediaStream;
  videoCodec: string;
  audioCodec: string;
  audioBitrate: string;
  audioVoice: boolean;
  videoBitrate: string;
  onError?: (error: string) => void;
  onConnected?: () => void;
}

interface ParsedOffer {
  iceUfrag: string;
  icePwd: string;
  medias: string[];
}

export class MediaMTXWebRTCPublisher {
  private retryPause: number;
  private conf: Conf;
  private state: ConnectionState;
  private restartTimeout: number | null;
  private pc: RTCPeerConnection | null;
  private offerData: ParsedOffer | null;
  private sessionUrl: string | null;
  private queuedCandidates: RTCIceCandidate[];

  constructor(conf: Conf) {
    this.retryPause = 2000;
    const clonedStream = new MediaStream();
    conf.stream.getTracks().forEach((track) => {
      clonedStream.addTrack(track.clone());
    });

    this.conf = { ...conf, stream: clonedStream };
    this.state = "running";
    this.restartTimeout = null;
    this.pc = null;
    this.offerData = null;
    this.sessionUrl = null;
    this.queuedCandidates = [];
    this.start();
  }

  /**
   * Close the publisher and release all resources.
   */
  close = (): void => {
    this.state = "closed";
    if (this.pc) {
      this.pc.close();
    }
    if (this.restartTimeout !== null) {
      clearTimeout(this.restartTimeout);
    }
    this.conf.stream.getTracks().forEach((track) => track.stop());
  };

  static unquoteCredential(v: string): string {
    return JSON.parse(`"${v}"`);
  }

  static linkToIceServers(links: string | null): RTCIceServer[] {
    if (!links) {
      return [];
    }

    return links.split(", ").map((link) => {
      const match = link.match(
        /^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i
      );
      if (!match) {
        throw new Error("Failed to parse ICE server link.");
      }

      const iceServer: RTCIceServer = { urls: [match[1]] };
      if (match[3] !== undefined && match[4] !== undefined) {
        iceServer.username = MediaMTXWebRTCPublisher.unquoteCredential(
          match[3]
        );
        iceServer.credential = MediaMTXWebRTCPublisher.unquoteCredential(
          match[4]
        );
        // iceServer.credentialType = "password";
      }

      return iceServer;
    });
  }

  static parseOffer(offer: string): ParsedOffer {
    const parsed: ParsedOffer = { iceUfrag: "", icePwd: "", medias: [] };

    for (const line of offer.split("\r\n")) {
      if (line.startsWith("m=")) {
        parsed.medias.push(line.slice(2));
      } else if (!parsed.iceUfrag && line.startsWith("a=ice-ufrag:")) {
        parsed.iceUfrag = line.slice("a=ice-ufrag:".length);
      } else if (!parsed.icePwd && line.startsWith("a=ice-pwd:")) {
        parsed.icePwd = line.slice("a=ice-pwd:".length);
      }
    }

    return parsed;
  }

  static generateSdpFragment(
    offerData: ParsedOffer,
    candidates: RTCIceCandidate[]
  ): string {
    const candidatesByMedia: Record<number, RTCIceCandidate[]> = {};

    for (const candidate of candidates) {
      const mid = candidate.sdpMLineIndex ?? 0;
      candidatesByMedia[mid] = candidatesByMedia[mid] || [];
      candidatesByMedia[mid].push(candidate);
    }

    let fragment =
      `a=ice-ufrag:${offerData.iceUfrag}\r\n` +
      `a=ice-pwd:${offerData.icePwd}\r\n`;
    let mid = 0;

    for (const media of offerData.medias) {
      if (candidatesByMedia[mid]) {
        fragment += `m=${media}\r\n` + `a=mid:${mid}\r\n`;
        for (const candidate of candidatesByMedia[mid]) {
          fragment += `a=${candidate.candidate}\r\n`;
        }
      }
      mid++;
    }

    return fragment;
  }

  static setCodec(section: string, codec: string) {
    const lines = section.split("\r\n");
    const lines2 = [];
    const payloadFormats = [];

    for (const line of lines) {
      if (!line.startsWith("a=rtpmap:")) {
        lines2.push(line);
      } else {
        if (line.toLowerCase().includes(codec)) {
          payloadFormats.push(line.slice("a=rtpmap:".length).split(" ")[0]);
          lines2.push(line);
        }
      }
    }

    const lines3 = [];
    let firstLine = true;

    for (const line of lines2) {
      if (firstLine) {
        firstLine = false;
        lines3.push(
          line.split(" ").slice(0, 3).concat(payloadFormats).join(" ")
        );
      } else if (line.startsWith("a=fmtp:")) {
        if (
          payloadFormats.includes(line.slice("a=fmtp:".length).split(" ")[0])
        ) {
          lines3.push(line);
        }
      } else if (line.startsWith("a=rtcp-fb:")) {
        if (
          payloadFormats.includes(line.slice("a=rtcp-fb:".length).split(" ")[0])
        ) {
          lines3.push(line);
        }
      } else {
        lines3.push(line);
      }
    }

    return lines3.join("\r\n");
  }

  static setVideoBitrate(section: string, bitrate: string) {
    let lines = section.split("\r\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("c=")) {
        lines = [
          ...lines.slice(0, i + 1),
          "b=TIAS:" + (parseInt(bitrate) * 1024).toString(),
          ...lines.slice(i + 1),
        ];
        break;
      }
    }

    return lines.join("\r\n");
  }

  static setAudioBitrate(section: string, bitrate: string, voice: boolean) {
    let opusPayloadFormat = "";
    const lines = section.split("\r\n");

    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].startsWith("a=rtpmap:") &&
        lines[i].toLowerCase().includes("opus/")
      ) {
        opusPayloadFormat = lines[i].slice("a=rtpmap:".length).split(" ")[0];
        break;
      }
    }

    if (opusPayloadFormat === "") {
      return section;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("a=fmtp:" + opusPayloadFormat + " ")) {
        if (voice) {
          lines[i] =
            "a=fmtp:" +
            opusPayloadFormat +
            " minptime=10;useinbandfec=1;maxaveragebitrate=" +
            (parseInt(bitrate) * 1024).toString();
        } else {
          lines[i] =
            "a=fmtp:" +
            opusPayloadFormat +
            " maxplaybackrate=48000;stereo=1;sprop-stereo=1;maxaveragebitrate=" +
            (parseInt(bitrate) * 1024).toString();
        }
      }
    }

    return lines.join("\r\n");
  }

  static editOffer(
    sdp: string,
    videoCodec: string,
    audioCodec: string,
    audioBitrate: string,
    audioVoice: boolean
  ) {
    const sections = sdp.split("m=");

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith("video")) {
        sections[i] = this.setCodec(sections[i], videoCodec);
      } else if (sections[i].startsWith("audio")) {
        sections[i] = this.setAudioBitrate(
          this.setCodec(sections[i], audioCodec),
          audioBitrate,
          audioVoice
        );
      }
    }

    return sections.join("m=");
  }

  static editAnswer(sdp: string, videoBitrate: string) {
    const sections = sdp.split("m=");

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].startsWith("video")) {
        sections[i] = this.setVideoBitrate(sections[i], videoBitrate);
      }
    }

    return sections.join("m=");
  }

  private start(): void {
    this.requestICEServers()
      .then((iceServers) => this.setupPeerConnection(iceServers))
      .then((offer) => this.sendOffer(offer))
      .then((answer) => this.setAnswer(answer))
      .catch((error) => {
        this.handleError(error.toString());
      });
  }

  private handleError(error: string): void {
    if (this.state !== "running") {
      return;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.offerData = null;
    if (this.sessionUrl) {
      fetch(this.sessionUrl, { method: "DELETE" });
      this.sessionUrl = null;
    }

    this.queuedCandidates = [];
    this.state = "restarting";
    this.restartTimeout = window.setTimeout(() => {
      this.restartTimeout = null;
      this.state = "running";
      this.start();
    }, this.retryPause);

    this.conf.onError?.(`${error}, retrying in a few seconds`);
  }

  private async requestICEServers(): Promise<RTCIceServer[]> {
    const response = await fetch(this.conf.url, { method: "OPTIONS" });
    const links = response.headers.get("Link");
    return MediaMTXWebRTCPublisher.linkToIceServers(links);
  }

  private async setupPeerConnection(
    iceServers: RTCIceServer[]
  ): Promise<string> {
    if (this.state !== "running") {
      throw new Error("closed");
    }

    this.pc = new RTCPeerConnection({
      iceServers,
    });

    this.pc.onicecandidate = (event) => this.onLocalCandidate(event);
    this.pc.onconnectionstatechange = () => this.onConnectionState();

    this.conf.stream.getTracks().forEach((track) => {
      if (this.pc) {
        this.pc.addTrack(track, this.conf.stream);
      }
    });

    const offer = await this.pc.createOffer();
    if (!offer.sdp) {
      throw new Error("Failed to create offer: SDP is undefined");
    }
    this.offerData = MediaMTXWebRTCPublisher.parseOffer(offer.sdp);
    if (!this.pc) {
      throw new Error("PeerConnection is not initialized");
    }
    await this.pc.setLocalDescription(offer);
    return offer.sdp as string;
  }

  private async sendOffer(offer: string): Promise<string> {
    if (this.state !== "running") {
      throw new Error("closed");
    }

    offer = MediaMTXWebRTCPublisher.editOffer(
      offer,
      this.conf.videoCodec,
      this.conf.audioCodec,
      this.conf.audioBitrate,
      this.conf.audioVoice
    );

    return fetch(this.conf.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/sdp",
      },
      body: offer,
    }).then(async (res) => {
      switch (res.status) {
        case 201:
          break;
        case 400:
          return res.json().then((e) => {
            throw new Error(e.error);
          });
        default:
          throw new Error(`bad status code ${res.status}`);
      }

      const locationHeader = res.headers.get("location");
      if (!locationHeader) {
        throw new Error("Missing location header in response");
      }
      this.sessionUrl = new URL(locationHeader, this.conf.url).toString();

      return res.text();
    });
  }

  private async setAnswer(answer: string): Promise<void> {
    if (this.state !== "running") {
      throw new Error("closed");
    }

    const editedAnswer = MediaMTXWebRTCPublisher.editAnswer(
      answer,
      this.conf.videoBitrate
    );

    if (!this.pc) {
      throw new Error("PeerConnection is not initialized");
    }
    return this.pc
      .setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: editedAnswer,
        })
      )
      .then(() => {
        if (this.state !== "running") {
          return;
        }

        if (this.queuedCandidates.length !== 0) {
          this.sendLocalCandidates(this.queuedCandidates);
          this.queuedCandidates = [];
        }
      });
  }

  private onLocalCandidate(event: RTCPeerConnectionIceEvent): void {
    if (this.state !== "running" || !event.candidate) {
      return;
    }

    if (this.sessionUrl === null) {
      this.queuedCandidates.push(event.candidate);
    } else {
      this.sendLocalCandidates([event.candidate]);
    }
  }

  private sendLocalCandidates(candidates: RTCIceCandidate[]): void {
    if (!this.sessionUrl || !this.offerData) {
      return;
    }

    fetch(this.sessionUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/trickle-ice-sdpfrag",
        "If-Match": "*",
      },
      body: MediaMTXWebRTCPublisher.generateSdpFragment(
        this.offerData,
        candidates
      ),
    })
      .then((res) => {
        switch (res.status) {
          case 204:
            break;
          case 404:
            throw new Error("stream not found");
          default:
            throw new Error(`bad status code ${res.status}`);
        }
      })
      .catch((err) => {
        this.handleError(err.toString());
      });
  }

  private onConnectionState(): void {
    if (!this.pc || this.state !== "running") {
      return;
    }

    if (
      this.pc.connectionState === "failed" ||
      this.pc.connectionState === "closed"
    ) {
      this.handleError("Peer connection closed");
    } else if (this.pc.connectionState === "connected") {
      this.conf.onConnected?.();
    }
  }
}