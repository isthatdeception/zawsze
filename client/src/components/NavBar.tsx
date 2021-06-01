// static import
import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/layout";
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
    {
      /** username of logged in person */
    }

    body = (
      <Flex>
        <Text
          // bgGradient="linear(to-l, #e0eafc,#cfdef3)"
          bgGradient="linear(to-l, #C33764, #1D2671)"
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
      // bgGradient="linear(to right, #606c88, #3f4c6b)"
      bg="#eeeeee"
      w="100%"
      boxSizing="border-box"
      p={4}
      color="#435560"
      ml="auto"
      align="center"
    >
      <NextLink href="/">
        <Link _hover={{ textDecor: "none", textColor: "#383e56" }}>
          <Heading
            fontSize="3xl"
            fontWeight="extrabold"
            fontStyle="inherit"
            textColor="#325288"
            bgColor="#f4eee8"
            ml="3"
          >
            zawsze
            <Box as="span" ml="1" color="#383e56" fontSize="semibold">
              .
            </Box>
          </Heading>
        </Link>
      </NextLink>
      <Box ml="auto" position="sticky">
        {body}
      </Box>
    </Flex>
  );
};
