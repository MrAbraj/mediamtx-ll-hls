"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Text,
  VStack,
  HStack,
  Container,
  useBreakpointValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { TopBar } from "../ui/TopBar";
import { FaCircle } from "react-icons/fa";
import { CustomButton } from "./CustomButton";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Landing = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const titleSize =
    useBreakpointValue({ base: "4xl", md: "6xl", lg: "7xl" }) ?? "4xl";
  const subtitleSize = useBreakpointValue({ base: "lg", md: "xl" }) ?? "lg";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <VStack height="100vh" width="100%" bg="#ffffff" color="#333333">
      <TopBar broadcastText="READY" />

      <Container
        maxW="4xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={100}
      >
        <VStack
          gap={8}
          textAlign="center"
          animation={`${fadeIn} 1s ease-out`}
          w="full"
        >
          <Text
            fontFamily="serif"
            fontWeight="bold"
            fontSize={titleSize}
            lineHeight="tight"
            color="#008080"
            letterSpacing="tight"
          >
            Broadcast Live
          </Text>

          <Text
            fontFamily="sans-serif"
            fontSize={subtitleSize}
            color="#666666"
            maxW="2xl"
            lineHeight="relaxed"
            fontWeight="normal"
          >
            Your Gateway to Seamless Broadcasting
          </Text>

          <HStack gap={6} w="full" maxW="lg" justify="center">
            <CustomButton
              onClick={() => {
                router.push("/host");
              }}
              text="Start Hosting"
              variant="solid"
            />
            <CustomButton
              onClick={() => {
                router.push("/client");
              }}
              text="Watch Stream"
              variant="outline"
            />
          </HStack>

          <HStack gap={4} mt={8} opacity={0.7}>
            <FaCircle size={10} color="#00b3b3" />
            <Text fontSize="sm" color="#666666" fontFamily="sans-serif">
              Ultra-low latency streaming
            </Text>
            <FaCircle size={10} color="#00b3b3" />
          </HStack>
        </VStack>
      </Container>
    </VStack>
  );
};
