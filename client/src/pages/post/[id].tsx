// static imports
import { withUrqlClient } from "next-urql";
import { Box, Heading } from "@chakra-ui/react";

// relative imports
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Layout } from "../../components/Layout";
import { getPostFromServer } from "../../utils/getPostFromServer";

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
      <Heading mb={6}>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
