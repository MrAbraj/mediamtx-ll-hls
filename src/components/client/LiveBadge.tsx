import { Box, HStack, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const blink = keyframes`
  0%,100% { opacity:1; }
  50% { opacity:.35; }
`;

interface LiveBadgeProps {
  live: boolean;
}

export const LiveBadge = ({ live }: LiveBadgeProps) => {
  return (
    <Box position="absolute" top={6} left={6}>
      <HStack
        bg="rgba(0,0,0,.75)"
        px={4}
        py={2}
        rounded="full"
        backdropFilter="blur(12px)"
      >
        <Box
          w={3}
          h={3}
          rounded="full"
          bg={live ? "red.400" : "gray.500"}
          animation={live ? `${blink} 1.2s infinite` : undefined}
        />

        <Text color="white" fontSize="sm" fontWeight="bold">
          {live ? "LIVE" : "OFFLINE"}
        </Text>
      </HStack>
    </Box>
  );
};
