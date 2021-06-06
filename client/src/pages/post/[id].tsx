// static imports
import { withUrqlClient } from "next-urql";
import { Box, Heading, Text, Stack } from "@chakra-ui/react";

// relative imports
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Layout } from "../../components/Layout";
import { getPostFromServer } from "../../utils/getPostFromServer";
import { PostInteractionButtons } from "../../components/PostInteractionButtons";

const Post = ({}) => {
  const [{ data, error, fetching }] = getPostFromServer();

  if (fetching) {
    return (
      <Layout>
        <div>... loading</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>{error.message}</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box
          marginTop={6}
          alignContent="center"
          flexDirection="column"
          justifyContent="center"
          display="flex"
        >
          oops! looks like no post found
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack spacing={4}>
        <Heading
          color="grey.800"
          fontSize="3xl"
          fontWeight="bold"
          fontStyle="unset"
        >
          {data.post.title}
        </Heading>
        <Text color="gray.700" fontWeight="semibold">
          {data.post.text}
        </Text>
        <Box>
          <PostInteractionButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Box>
      </Stack>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
