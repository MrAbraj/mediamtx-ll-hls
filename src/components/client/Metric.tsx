import { Box, Text } from "@chakra-ui/react";

interface MetricProps {
  label: string;
  value: string | number;
}

export const Metric = ({ label, value }: MetricProps) => {
  if (value === "--") {
    return null;
  }
  return (
    <Box textAlign="center" minW="70px">
      <Text fontSize="xs" color="gray.400" textTransform="uppercase">
        {label}
      </Text>

      <Text fontSize="sm" fontWeight="bold" color="white">
        {value}
      </Text>
    </Box>
  );
};
