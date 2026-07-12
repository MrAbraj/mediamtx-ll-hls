import { Box, HStack, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaCircle } from "react-icons/fa";

const radioBlinking = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

interface BroadcastStatusProps {
  isStreaming?: boolean;
  text: string;
}

export const BroadcastStatus = ({
  isStreaming,
  text,
}: BroadcastStatusProps) => {
  return (
    <HStack gap={3} bg="#f0f4f8" px={4} py={2} rounded="full" shadow="sm">
      <Box animation={`${radioBlinking} 1.5s ease-in-out infinite`}>
        <FaCircle size={10} color={isStreaming ? "#ff4444" : "#008080"} />
      </Box>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color={isStreaming ? "#ff4444" : "#008080"}
      >
        {text}
      </Text>
    </HStack>
  );
};
