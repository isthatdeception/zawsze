// static imports
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Box } from "@chakra-ui/react";

// relative imports
import { createUrqlClient } from "../../utils/createUrqlClient";
import { usePostQuery } from "../../generated/graphql";
import { Layout } from "../../components/Layout";

const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query._id == "string" ? parseInt(router.query._id) : -1;

  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      _id: intId,
    },
  });

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
        <Box>oops! looks like no post found</Box>
      </Layout>
    );
  }

  return <Layout>{data.post.title}</Layout>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
