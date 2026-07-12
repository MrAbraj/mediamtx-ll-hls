import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { BsCameraVideoOffFill } from "react-icons/bs";

export const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  console.log(stream);

  return (
    <Box
      bg="gray.800"
      rounded="xl"
      overflow="hidden"
      aspectRatio="16/9"
      w="3xl"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {stream ? (
        <video
          ref={ref}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <BsCameraVideoOffFill size={70} color="gray" opacity="0.2" />
      )}
    </Box>
  );
};
