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
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
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
          fontWeight="extrabold"
          mr={4}
        >
          {data.me.username}
        </Text>

        {/** logout functionality */}
        <Button
          size="md"
          variant="solid"
          ml={2}
          colorScheme="twitter"
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
    <Flex bg="#f3f4ed" w="100%" p={4} color="#435560" ml="auto">
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};
