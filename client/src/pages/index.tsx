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
      <Flex align="center">
        <Heading
          fontSize="6xl"
          fontWeight="extrabold"
          bgGradient="linear(to-l, #f05454, #f05454)"
          fontStyle="inherit"
        >
          zawsze
        </Heading>

        <NextLink href="/create-post">
          <Link ml="auto" textDecoration="none">
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
                    <Heading fontSize="xl">{post.title}</Heading>
                    <Text size="sm" ml={4} fontWeight="medium">
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
