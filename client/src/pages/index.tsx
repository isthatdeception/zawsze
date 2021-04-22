// static imports
import { Link, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";

// relative imports
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  // posts
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <Text
        bgGradient="linear(to-l, #0a043c,#FF0080)"
        bgClip="text"
        fontSize="6xl"
        fontWeight="extrabold"
      >
        Welcome to zawsze!
        <br />
        have fun.
      </Text>
      <NextLink href="/create-post">
        <Link>create-post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>...loading</div>
      ) : (
        data.posts.map((post) => <div key={post._id}>{post.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
