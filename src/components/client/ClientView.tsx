"use client";

import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { HLS_URL } from "@/config/config";
import { LiveBadge } from "./LiveBadge";
import { StreamInfo } from "./StreamInfo";
import { PlaybackOverlay } from "./PlaybackOverlay";
import { getBoolean } from "@/utils/get-boolean";

export const ClientView = () => {
  const searchParams = useSearchParams();
  const streamName = searchParams.get("name") ?? "BroadcastStudio";

  const streamUrl = useMemo(
    () => `${HLS_URL}${streamName}/index.m3u8`,
    [streamName],
  );

  const player = useHlsPlayer({
    streamUrl,
  });

  return (
    <Box h="100vh" bg="black" position="relative" overflow="hidden">
      <video
        ref={player.videoRef}
        controls={getBoolean(searchParams.get("controls"), true)}
        muted={getBoolean(searchParams.get("muted"), true)}
        autoPlay={getBoolean(searchParams.get("autoplay"), true)}
        playsInline={getBoolean(searchParams.get("playsinline"), true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <LiveBadge live={player.status === "playing"} />
      <PlaybackOverlay status={player.status} error={player.error} />
      <StreamInfo metrics={player.metrics} />
    </Box>
  );
};
