"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

import {
  AudioTrack,
  INITIAL_METRICS,
  PlayerMetrics,
  PlayerStatus,
} from "@/types/player";

import { createHlsPlayer } from "@/utils/create-hls-player";
import { getMetrics } from "@/utils/get-hls-metrics";

const RETRY_DELAY = 2000;
const METRICS_UPDATE_INTERVAL = 500;

interface UseHlsPlayerOptions {
  streamUrl: string;
}

export function useHlsPlayer({ streamUrl }: UseHlsPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [metrics, setMetrics] = useState<PlayerMetrics>(INITIAL_METRICS);

  const clearRetry = useCallback(() => {
    if (!retryTimer.current) return;

    clearTimeout(retryTimer.current);
    retryTimer.current = null;
  }, []);

  const destroyPlayer = useCallback(() => {
    clearRetry();

    hlsRef.current?.destroy();
    hlsRef.current = null;

    setAudioTracks([]);
    setMetrics(INITIAL_METRICS);
  }, [clearRetry]);

  const load = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    destroyPlayer();

    setStatus("connecting");
    setError(null);

    if (!Hls.isSupported()) {
      // Native Safari playback can go here.
      return;
    }

    hlsRef.current = createHlsPlayer({
      streamUrl,
      video,

      onPlaying: () => {
        setStatus("playing");
      },

      onAudioTracks: setAudioTracks,

      onError: (message) => {
        setStatus("reconnecting");
        setError(message);

        destroyPlayer();

        retryTimer.current = setTimeout(load, RETRY_DELAY);
      },
    });
  }, [destroyPlayer, streamUrl]);

  useEffect(() => {
    load();

    return destroyPlayer;
  }, [load, destroyPlayer]);

  useEffect(() => {
    if (status !== "playing") return;

    let frameId: number;
    let lastUpdate = 0;

    const update = (time: number) => {
      frameId = requestAnimationFrame(update);

      if (time - lastUpdate < METRICS_UPDATE_INTERVAL) {
        return;
      }

      lastUpdate = time;

      const video = videoRef.current;
      const hls = hlsRef.current;

      if (!video || !hls) return;

      setMetrics(getMetrics(video, hls));
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [status]);

  useEffect(() => {
  if (status !== "playing") return;

  const video = videoRef.current;
  const hls = hlsRef.current;

  if (!video || !hls) return;

  const syncToLive = () => {
    if (hls.liveSyncPosition == null) return;

    const drift = hls.liveSyncPosition - video.currentTime;

    // Only jump if we've actually fallen behind.
    if (drift > 0.35) {
      video.currentTime = hls.liveSyncPosition;
    }
  };

  video.addEventListener("play", syncToLive);
  video.addEventListener("playing", syncToLive);

  return () => {
    video.removeEventListener("play", syncToLive);
    video.removeEventListener("playing", syncToLive);
  };
}, [status]);

  return {
    videoRef,
    status,
    error,
    metrics,
    audioTracks,
  };
}
