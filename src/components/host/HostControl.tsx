import { VStack, HStack, Button } from "@chakra-ui/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { SplitButton } from "./button/SplitButton";
import { MediaDeviceOption } from "@/hooks/media/useMediaDevices";
import { useHost } from "@/context/HostContext";

export const HostControl = ({
  microphones,
  cameras,
  isStreaming,
  onStart,
  onStop,
}: {
  microphones: MediaDeviceOption[];
  cameras: MediaDeviceOption[];
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
}) => {
  const host = useHost();

  return (
    <VStack gap={6}>
      <HStack>
        <SplitButton
          icon={host.micEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          isActive={host.micEnabled}
          menuItems={microphones.map((device) => ({
            label: device.label,
            value: device.deviceId,
          }))}
          currentMenuItem={host.selectedMicDeviceId ?? ""}
          onMainButtonClick={() => host.setMicEnabled(!host.micEnabled)}
          onMenuItemClick={host.setSelectedMicDeviceId}
        />

        <SplitButton
          icon={host.cameraEnabled ? <FaVideo /> : <FaVideoSlash />}
          isActive={host.cameraEnabled}
          menuItems={cameras.map((device) => ({
            label: device.label,
            value: device.deviceId,
          }))}
          currentMenuItem={host.selectedCameraDeviceId ?? ""}
          onMainButtonClick={() => host.setCameraEnabled(!host.cameraEnabled)}
          onMenuItemClick={host.setSelectedCameraDeviceId}
        />
      </HStack>
      <Button
        bg={isStreaming ? "#ff4444" : "#008080"}
        color="white"
        size="lg"
        onClick={isStreaming ? onStop : onStart}
        rounded="xl"
        px={12}
        py={6}
        fontSize="xl"
        fontWeight="bold"
        _hover={{
          bg: isStreaming ? "#dd3333" : "#006666",
          transform: "scale(1.05)",
        }}
        transition="all 0.3s ease"
        shadow="lg"
      >
        {isStreaming ? "Stop Broadcasting" : "Start Broadcasting"}
      </Button>
    </VStack>
  );
};
