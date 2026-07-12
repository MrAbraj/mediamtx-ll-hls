import { PlayerStatus } from "@/types/player";
import { Box } from "@chakra-ui/react";

interface PlaybackOverlayProps {
  status: PlayerStatus;
  error: string | null;
}

export const PlaybackOverlay = (props: PlaybackOverlayProps) => {
  const { status, error } = props;

  if (status === "playing") {
    return null;
  }

  return (
    <Box
      position="absolute"
      inset="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0,0,0,.45)"
      color="white"
      fontWeight="semibold"
      pointerEvents="none"
    >
      {error ??
        (status === "connecting"
          ? "Connecting..."
          : status === "reconnecting"
            ? "Reconnecting..."
            : "Unable to play stream")}
    </Box>
  );
};
