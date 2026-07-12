"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PUBLISHER_CONFIG } from "@/config/config";
import { MediaMTXWebRTCPublisher } from "@/service/MediaMTXWebRTCPublisher";
import { createWhipUrl } from "@/utils/create-whip-url";
import { showError, showSuccess } from "@/utils/toast";

export function useMediaPublisher() {
  const publisherRef = useRef<MediaMTXWebRTCPublisher | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);

  const stop = useCallback(() => {
    publisherRef.current?.close();
    publisherRef.current = null;
    setIsPublishing(false);
  }, []);

  const publish = useCallback(
    async (stream: MediaStream | null, streamKey: string) => {
      if (!stream || !streamKey) {
        showError(
          "Publishing Error",
          "Please enable your webcam and microphone.",
        );
        return;
      }

      stop();

      const handleConnected = () => {
        setIsPublishing(true);

        showSuccess("Stream Live", "The stream is now live.");
      };

      const handleError = (error: unknown) => {
        console.error(error);

        showError(
          "Publishing Error",
          "An error occurred while publishing the stream.",
        );

        stop();
      };

      try {
        publisherRef.current = new MediaMTXWebRTCPublisher({
          url: createWhipUrl(streamKey.replaceAll(' ', '')),
          stream,
          ...PUBLISHER_CONFIG,
          onConnected: handleConnected,
          onError: handleError,
        });
      } catch (error) {
        console.error(error);

        showError(
          "Initialization Error",
          "Failed to initialize the media publisher.",
        );

        stop();
      }
    },
    [stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPublishing,
    publish,
    stop,
  };
}
