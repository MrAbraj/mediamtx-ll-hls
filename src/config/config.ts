import Hls from "hls.js";

export const DOMAIN = "http://127.0.0.1"

export const API_URL = `${DOMAIN}:9997/v3/paths/list`

export const WHIP_URL = `${DOMAIN}:8889/`

export const HLS_URL = `${DOMAIN}:8888/`

export const PUBLISHER_CONFIG = {
  videoCodec: "h264",
  videoBitrate: "5000",
  audioCodec: "opus",
  audioBitrate: "32",
  audioVoice: true,
};

export const HLS_CONFIG: Partial<Hls["config"]> = {
  lowLatencyMode: true,
  maxLiveSyncPlaybackRate: 1.5,
};

export const WEBCAM_CONSTRAINTS: MediaTrackConstraints = {
  width: {
    ideal: 1280,
    max: 1280,
  },
  height: {
    ideal: 720,
    max: 720,
  },
  frameRate: {
    ideal: 30,
    max: 30,
  },
};

export const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};