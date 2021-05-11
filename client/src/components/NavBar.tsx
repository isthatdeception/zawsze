// static import
import { Button } from "@chakra-ui/button";
import { Box, Flex, Link, Text } from "@chakra-ui/layout";
import NextLink from "next/link";

// relative import
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isOnServer } from "../utils/isOnServer";

// navbar
interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  // logout functionality
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  // useme query to fetch the user details
  const [{ data, fetching }] = useMeQuery({ pause: isOnServer() });
  // first
  let body = null;

  // data is loading
  if (fetching) {
  } else if (!data?.me) {
    // user is not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link
            mr={2}
            color="#536162"
            _hover={{
              textDecor: "none",
              textColor: "black",
              fontWeight: "1em",
            }}
          >
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link
            color="#536162"
            _hover={{
              textDecor: "none",
              textColor: "black",
              fontWeight: "1em",
            }}
          >
            register
          </Link>
        </NextLink>
      </>
    );
  } else {
    // user is logged in
    body = (
      <Flex>
        {/** username of logged in person */}
        <Text
          bgGradient="linear(to-l, #0a043c,#FF0080)"
          bgClip="text"
          fontSize="lg"
          fontWeight="semibold"
          mr={4}
          mt={2}
          position="relative"
        >
          {data.me.username}
        </Text>

        {/** logout functionality */}
        <Button
          size="md"
          variant="solid"
          ml={2}
          position="inherit"
          colorScheme="twitter"
          textDecoration="none"
          isLoading={logoutFetching}
          onClick={() => {
            logout();
          }}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      zIndex="overlay"
      position="sticky"
      top={0}
      bg="#f3f4ed"
      w="100%"
      boxSizing="border-box"
      p={4}
      color="#435560"
      ml="auto"
    >
      <Box ml="auto" position="sticky">
        {body}
      </Box>
    </Flex>
  );
};
