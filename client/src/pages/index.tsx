// static imports
import { DeleteIcon } from "@chakra-ui/icons";
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
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  // posts
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  // if we are not loading and  we got not data then we did something very wrong
  if (!fetching && !data) {
    return <div>something is very wrong here. we got no posts to show you</div>;
  }

  return (
    <Layout>
      <Flex align="center" display="flex">
        <Flex direction="row">
          <NextLink href="/create-post">
            <Button
              as={Link}
              ml="auto"
              color="linear(to-right, #114357, #F29492)"
              bgGradient="linear(to-right, #114357, #F29492)"
              _hover={{
                textDecor: "none",
                textColor: "#536162",
                fontWeight: "1em",
              }}
            >
              create
            </Button>
          </NextLink>
        </Flex>
      </Flex>

      <br />
      {!data && fetching ? (
        <div>...loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) =>
            !post ? null : (
              <Box
                p={5}
                key={post.id}
                shadow="md"
                borderWidth="1px"
                flex="1"
                borderRadius="md"
              >
                <Flex>
                  <UpdooSec post={post} />
                  <Box flex={1}>
                    <Flex direction="column">
                      <Flex alignItems="flex-grow">
                        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
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

                        <DeleteIcon
                          ml="auto"
                          color="red.500"
                          aria-label="Delete Icon"
                          _hover={{
                            color: "red.700",
                          }}
                          onClick={() => {
                            deletePost({ id: post.id });
                          }}
                        />
                      </Flex>
                      <Text mt={4} alignItems="center">
                        {post.textSnippet}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            )
          )}
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
