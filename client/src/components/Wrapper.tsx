import { Box } from "@chakra-ui/layout";

interface WrapperProps {
  variant?: "small" | "regular"; // optional
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "780px" : "420px"}
      w="100%"
    >
      {children}
    </Box>
  );
};
