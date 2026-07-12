"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

import { HostControl } from "./HostControl";
import { VideoPreview } from "./VideoPreview";

import { useHost } from "@/context/HostContext";
import { useMediaDevices } from "@/hooks/media/useMediaDevices";
import { useUserMedia } from "@/hooks/media/useUserMedia";
import { useMediaPublisher } from "@/hooks/useMediaPublisher";
import { TopBar } from "../ui/TopBar";

const fadeIn = keyframes`
  from {
    opacity:0;
    transform:translateY(20px);
  }

  to {
    opacity:1;
    transform:translateY(0);
  }
`;

export const HostView = () => {
  const host = useHost();

  const devices = useMediaDevices();

  const media = useUserMedia({
    audioDeviceId: host.selectedMicDeviceId,
    videoDeviceId: host.selectedCameraDeviceId,
    audioEnabled: host.micEnabled,
    cameraEnabled: host.cameraEnabled,
  });

  const publisher = useMediaPublisher();
  const isStreaming = publisher.isPublishing;

  return (
    <Box minH="100vh" bg="white">
      <VStack gap={16}>
        <TopBar
          isStreaming={isStreaming}
          broadcastText={isStreaming ? "STREAMING" : "READY"}
        >
          <VStack>
            <Text
              fontFamily="serif"
              fontWeight="bold"
              fontSize="3xl"
              lineHeight="tight"
              color="#008080"
              letterSpacing="tight"
            >
              {host.broadcastName}
            </Text>

            <Text color="gray.500">Configure your stream and go live</Text>
          </VStack>
        </TopBar>
        <VStack gap={6} animation={`${fadeIn} 0.5s ease-in`}>
          <VideoPreview stream={media.stream} />

          <HostControl
            microphones={devices.microphones}
            cameras={devices.cameras}
            isStreaming={publisher.isPublishing}
            onStart={() =>
              publisher.publish(media.stream, host.broadcastName.trim())
            }
            onStop={publisher.stop}
          />
        </VStack>
      </VStack>
    </Box>
  );
};
