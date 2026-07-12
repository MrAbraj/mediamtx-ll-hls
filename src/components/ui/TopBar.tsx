import { HStack, Box, Image } from "@chakra-ui/react";
import { BroadcastStatus } from "./BroadcastStatus";

interface TopBarProps {
  broadcastText: string;
  isStreaming?: boolean;
  children?: React.ReactNode;
}

export const TopBar = (props: TopBarProps) => {
  const { isStreaming, broadcastText, children } = props;
  return (
    <HStack height={20} width="100%" justify="space-between" px={10}>
      <Box height={16} width={16}>
        <Image
          loading="lazy" 
          src="/mediamtx.png"
          alt="media-mtx"
        />
      </Box>
      {children}
      <BroadcastStatus isStreaming={isStreaming} text={broadcastText} />
    </HStack>
  );
};
