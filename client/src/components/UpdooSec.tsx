// reusable component for votes
// static imports
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
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
        variant="outline"
        colorScheme="twitter"
        aria-label="vote-up"
        fontSize="16px"
        size="sm"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          setLoadingState("updoo-loading");
          await vote({
            postId: post._id,
            value: 1,
          });
          setLoadingState("no-loading");
        }}
        isLoading={loadingState === "updoo-loading"}
      />
      {post.zpoints}
      <IconButton
        variant="outline"
        colorScheme="twitter"
        aria-label="vote-down"
        fontSize="16px"
        size="sm"
        icon={<ChevronDownIcon />}
        onClick={async () => {
          setLoadingState("downdoo-loading");
          await vote({
            postId: post._id,
            value: -1,
          });
          setLoadingState("no-loading");
        }}
        isLoading={loadingState === "downdoo-loading"}
      />
    </Flex>
  );
};
