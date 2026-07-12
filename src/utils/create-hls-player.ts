"use client";

import Hls from "hls.js";
import { HLS_CONFIG } from "@/config/config";
import { getPlayerError } from "./get-player-error";
import { AudioTrack } from "@/types/player";

interface Options {
  streamUrl: string;
  video: HTMLVideoElement;
  onPlaying: () => void;
  onAudioTracks: (tracks: AudioTrack[]) => void;
  onError: (message: string) => void;
}

export function createHlsPlayer({
  streamUrl,
  video,
  onPlaying,
  onAudioTracks,
  onError,
}: Options) {
  const hls = new Hls(HLS_CONFIG);

  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(streamUrl);
  });

  hls.on(Hls.Events.MANIFEST_PARSED, async () => {
    onAudioTracks(
      hls.audioTracks.map((track) => ({
        id: track.id,
        name: track.name,
      })),
    );

    try {
      await video.play();
      onPlaying();
    } catch {
      onError("Unable to start playback.");
    }
  });

  hls.on(Hls.Events.ERROR, (_, data) => {
    if (!data.fatal) return;

    onError(getPlayerError(data));
  });

  hls.attachMedia(video);

  return hls;
}
