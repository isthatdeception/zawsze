import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostInteractionButtonsProps {
  id: number;
  creatorId: number;
}

export const PostInteractionButtons: React.FC<PostInteractionButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: currentUserInfo }] = useMeQuery();

  const [, deletePost] = useDeletePostMutation();

  if (currentUserInfo?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box ml="auto">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <EditIcon
          mr={4}
          color="gray.200"
          aria-label="Edit Icon"
          _hover={{
            color: "blue.500",
          }}
        />
      </NextLink>

      <DeleteIcon
        color="gray.200"
        aria-label="Delete Icon"
        _hover={{
          color: "red.500",
        }}
        onClick={() => {
          deletePost({ id: id });
        }}
      />
    </Box>
  );
};
