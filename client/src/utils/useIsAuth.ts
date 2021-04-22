// static imports
import { useRouter } from "next/router";
import { useEffect } from "react";

// relative imports
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  // router
  const router = useRouter();
  // graphql mutations
  const [{ data, fetching }] = useMeQuery(); // for identifying that a user is authenticated or not

  // sideloading hook
  useEffect(() => {
    // if we are not loading and we don't have a user
    if (!fetching && !data?.me) {
      // after logged in where it should go
      // well we want to go to originally to the create-post
      router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
};
