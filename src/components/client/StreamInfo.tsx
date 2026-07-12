import { Box, HStack, VStack } from "@chakra-ui/react";
import { Metric } from "./Metric";
import { PlayerMetrics } from "@/types/player";

interface Props {
  metrics: PlayerMetrics;
}

export const StreamInfo = ({ metrics }: Props) => {
  return (
    <Box
      position="absolute"
      right={6}
      top={6}
      bg="rgba(0,0,0,0.75)"
      backdropFilter="blur(12px)"
      rounded="xl"
      px={5}
      py={4}
    >
      <VStack gap={3} align="center">
        <HStack gap={6}>
          <Metric label="Resolution" value={metrics.resolution} />
          <Metric label="Bitrate" value={metrics.bitrate} />
          <Metric label="Dropped" value={metrics.droppedFrames} />
        </HStack>

        <HStack gap={6}>
          <Metric
            label="Latency"
            value={
              metrics.latency == null
                ? "--"
                : `${metrics.latency.toFixed(1)} ms`
            }
          />
          <Metric
            label="Buffer"
            value={
              metrics.buffered == null
                ? "--"
                : `${metrics.buffered.toFixed(1)} ms`
            }
          />
        </HStack>
      </VStack>
    </Box>
  );
};
