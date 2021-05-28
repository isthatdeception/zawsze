// static imports
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";

// relative imports
import { Layout } from "../components/Layout";
import { UpdooSec } from "../components/UpdooSec";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  // posts
  const [variables, setVariables] = useState({
    limit: 30,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  // if we are not loading and  we got not data then we did something very wrong
  if (!fetching && !data) {
    return <div>something is very wrong here. we got no posts to show you</div>;
  }

  return (
    <Layout>
      <Flex align="center" display="flex">
        <Flex direction="row">
          <Heading
            fontSize="6xl"
            fontWeight="extrabold"
            fontStyle="inherit"
            textColor="#325288"
            bgColor="#f4eee8"
          >
            zawsze
            <Box as="span" ml="2" color="#383e56" fontSize="semibold">
              .
            </Box>
          </Heading>
        </Flex>
        <NextLink href="/create-post">
          <Link
            ml="auto"
            _hover={{
              textDecor: "none",
              textColor: "#536162",
              fontWeight: "1em",
            }}
          >
            create-post
          </Link>
        </NextLink>
      </Flex>

      <br />
      {!data && fetching ? (
        <div>...loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => (
            <Box
              p={5}
              key={post._id}
              shadow="md"
              borderWidth="1px"
              flex="1"
              borderRadius="md"
            >
              <Flex>
                <UpdooSec post={post} />
                <Flex direction="column">
                  <Flex alignItems="flex-grow">
                    <NextLink href="/post/[_id]" as={`/post/${post._id}`}>
                      <Link
                        _hover={{
                          textDecoration: "none",
                          textColor: "#536162",
                        }}
                      >
                        <Heading fontSize="xl">{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text
                      size="sm"
                      ml={4}
                      fontWeight="thin"
                      fontStyle="normal"
                      color="#383e56"
                      _hover={{
                        color: "#2b2e4a",
                        wordSpacing: 0.2,
                      }}
                    >
                      › posted by {post.creator.username}
                    </Text>
                  </Flex>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}

      {/** if there is no data we won't show laod more */}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            color="#ffffff"
            colorScheme="twitter"
            isLoading={fetching}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
