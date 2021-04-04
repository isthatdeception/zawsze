// static imports
import { Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";

// relative imports
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  // posts
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
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
      <br />
      {!data ? (
        <div>...loading</div>
      ) : (
        data.posts.map((post) => <div key={post._id}>{post.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
