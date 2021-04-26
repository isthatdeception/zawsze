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
import { usePostsQuery } from "../generated/graphql";
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

  // if we are not loading and  we got not data then we did something very wrong
  if (!fetching && !data) {
    return (
      <div>something is very wrong here. we got not posts to show you</div>
    );
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading
          fontSize="6xl"
          fontWeight="extrabold"
          bgGradient="linear(to-l, #f05454, #f05454)"
          fon
        >
          zawsze
        </Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create-post</Link>
        </NextLink>
      </Flex>

      <br />
      {!data && fetching ? (
        <div>...loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((post) => (
            <Box
              p={5}
              key={post._id}
              shadow="md"
              borderWidth="1px"
              flex="1"
              borderRadius="md"
            >
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}

      {/** if there is no data we won't show laod more */}
      {data ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={fetching}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts[data.posts.length - 1].createdAt,
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
