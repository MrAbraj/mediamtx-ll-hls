import Hls from "hls.js";

import { PlayerMetrics } from "@/types/player";

export const getMetrics = (
  video: HTMLVideoElement,
  hls: Hls,
): PlayerMetrics => {
  const level = hls.levels[hls.currentLevel];
  const quality = video.getVideoPlaybackQuality?.();

  return {
    latency: hls.latency ? hls.latency * 1000 : null,

    buffered: video.buffered.length
      ? (video.buffered.end(video.buffered.length - 1) -
          video.currentTime) *
        1000
      : null,

    droppedFrames: quality?.droppedVideoFrames ?? 0,

    resolution: level
      ? `${level.width} × ${level.height}`
      : "--",

    bitrate: level
      ? `${(level.bitrate / 1_000_000).toFixed(1)} Mbps`
      : "--",
  };
};