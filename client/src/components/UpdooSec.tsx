// reusable component for votes
// static imports
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";

// relative imports
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdooSecProps {
  post: PostSnippetFragment;
}

export const UpdooSec: React.FC<UpdooSecProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoo-loading" | "downdoo-loading" | "no-loading"
  >("no-loading");
  const [, vote] = useVoteMutation();

  return (
    // return something
    <Flex direction="column" justifyContent="center" alignItems="center" mr="4">
      <IconButton
        variant="ghost"
        colorScheme="green"
        aria-label="vote-up"
        fontSize="16px"
        size="sm"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          // if the user already upvoted it - do nothing
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("updoo-loading");
          await vote({
            postId: post._id,
            value: 1,
          });
          setLoadingState("no-loading");
        }}
        isLoading={loadingState === "updoo-loading"}
        _hover={{
          variant: "solid",
          color: "green",
          bgColor: "green.50",
        }}
        color={post.voteStatus === 1 ? "green" : "grey"}
      />

      <Text fontSize="medium" fontWeight="semibold" color="gray.500">
        {post.zpoints}
      </Text>

      <IconButton
        variant="ghost"
        colorScheme="red"
        aria-label="vote-down"
        fontSize="16px"
        size="sm"
        icon={<ChevronDownIcon />}
        onClick={async () => {
          // if the user already downvoted it - do nothing
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downdoo-loading");
          await vote({
            postId: post._id,
            value: -1,
          });
          setLoadingState("no-loading");
        }}
        isLoading={loadingState === "downdoo-loading"}
        _hover={{
          variant: "solid",
          color: "red",
          bgColor: "red.50",
        }}
        color={post.voteStatus === -1 ? "red" : "grey"}
      />
    </Flex>
  );
};
