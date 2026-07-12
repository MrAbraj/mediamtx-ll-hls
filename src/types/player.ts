export interface AudioTrack {
  id: number;
  name: string;
}

export interface PlayerMetrics {
  latency: number | null;
  buffered: number | null;
  droppedFrames: number;
  resolution: string;
  bitrate: string;
}

export type PlayerStatus =
  | "idle"
  | "connecting"
  | "playing"
  | "reconnecting"
  | "error";

export const INITIAL_METRICS: PlayerMetrics = {
  latency: null,
  buffered: null,
  droppedFrames: 0,
  resolution: "--",
  bitrate: "--",
};