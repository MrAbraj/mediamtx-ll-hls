"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AUDIO_CONSTRAINTS, WEBCAM_CONSTRAINTS } from "@/config/config";

interface UseUserMediaOptions {
  audioDeviceId?: string | null;
  videoDeviceId?: string | null;
  audioEnabled?: boolean;
  cameraEnabled?: boolean;
}

export function useUserMedia({
  audioDeviceId,
  videoDeviceId,
  audioEnabled = true,
  cameraEnabled = true,
}: UseUserMediaOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoConstraints = useMemo(
    () =>
      !cameraEnabled
        ? false
        : {
            ...WEBCAM_CONSTRAINTS,
            ...(videoDeviceId && {
              deviceId: { exact: videoDeviceId },
            }),
          },
    [cameraEnabled, videoDeviceId],
  );

  const audioConstraints = useMemo(
    () =>
      !audioEnabled
        ? false
        : {
            ...AUDIO_CONSTRAINTS,
            ...(audioDeviceId && {
              deviceId: { exact: audioDeviceId },
            }),
          },
    [audioEnabled, audioDeviceId],
  );

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => {
    if (!audioEnabled && !cameraEnabled) {
      stop();
      return;
    }

    let cancelled = false;

    const start = async () => {
      stop();

      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints,
        });

        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = media;
        setStream(media);
      } catch (error) {
        console.error(error);
        stop();
      }
    };

    void start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [audioConstraints, audioEnabled, cameraEnabled, stop, videoConstraints]);

  return {
    stream,
    stop,
  };
}
