import { Text } from "@chakra-ui/react";
import { NavBar } from "../components/NavBar";

const Index = () => {
  return (
    <>
      <NavBar />
      <Text
        bgGradient="linear(to-l, #0a043c,#FF0080)"
        bgClip="text"
        fontSize="6xl"
        fontWeight="extrabold"
      >
        Welcome to zawsze!
        <br />
        have fun.
      </Text>
    </>
  );
};

export default Index;
