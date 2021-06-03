// relative imports
import { usePostQuery } from "../generated/graphql";
import { getPostIdFromServer } from "./getPostIdFromServer";

export const getPostFromServer = () => {
  const intId = getPostIdFromServer();

  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
