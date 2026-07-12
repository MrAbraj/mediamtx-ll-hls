"use client";
import { Button } from "@chakra-ui/react";

interface CustomButtonProps {
  onClick: () => void;
  text: string;
  variant: "solid" | "outline";
}

export const CustomButton = (props: CustomButtonProps) => {
  const { onClick, text, variant } = props;
  return (
    <Button
      variant={variant}
      colorPalette="teal"
      size="lg"
      px={8}
      py={6}
      rounded="xl"
      fontFamily="sans-serif"
      fontWeight="semibold"
      fontSize="lg"
      _hover={{
        transform: "translateY(-3px) scale(1.05)",
        shadow: "xl",
      }}
      _active={{
        transform: "translateY(-1px) scale(1.02)",
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      shadow="lg"
      onClick={onClick}
    >
      {text}
    </Button>
  );
};
