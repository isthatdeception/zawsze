// static imports
import { dedupExchange, fetchExchange, gql, stringifyVariables } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";

// relative imports
import { betterUpdateQuery } from "./betterUpdateQuery";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { isOnServer } from "./isOnServer";

// for all unauthenticated errors
// redirecting them to the login page for thier verification
export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        // If the OperationResult has an error send a request to sentry
        if (error?.message.includes("not authenticated")) {
          // the error is a CombinedError with networkError and graphqlErrors properties
          // Whatever error reporting we have

          // if not authenticated we will direct him to the login page
          Router.replace("/login");
        }
      })
    );
  };

/**
 * for pagination to our page so that whole page does not load a myraid of the posts
 * this can help to actually regulate the overall travel to our server and the user
 */
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);

    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    // if any how there is not much to return it means the size info will be  0
    // and there will be no relation to return  to the client
    // that's why returning undefined
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey);

    // if it is already not in the system cache
    // we will fetch more posts from the server by requesting
    // within a certain limit
    info.partial = !isItInTheCache;

    // after it we need to read the infos from our post queries
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((info) => {
      const key = cache.resolve(entityKey, info.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");

      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }

      results.push(...data); // combining the data
    });

    return {
      __typename: "PaginatedPosts",
      hasMore, // true-false
      posts: results,
    };
  };
};

/**
 * this function takes all the data of screen and just reload the
 * existing cache so that the new data can be shown immediatley to the user with
 * thier interactons
 * @param cache
 */
function invalidateScreenData(cache: Cache) {
  const allFields = cache.inspectFields("Query");

  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");

  fieldInfos.forEach((info) => {
    cache.invalidate("Query", "posts", info.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  // if the page is server rendered
  if (isOnServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: process.env.API_URL!,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: "Post",
                id: (_args as DeletePostMutationVariables).id,
              });
            },

            vote: (_result, _args, cache, _info) => {
              const { postId, value } = _args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    zpoints
                    voteStatus
                  }
                `,
                { id: postId } as any
              );

              // if we have successfully read the post zpoints
              // update it
              if (data) {
                // if the user is already voted
                if (data.voteStatus === value) {
                  return;
                }

                const newzpoints =
                  (data.zpoints as number) + (!data.voteStatus ? 1 : 2) * value;

                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      zpoints
                      voteStatus
                    }
                  `,
                  { id: postId, zpoints: newzpoints, voteStatus: value } as any
                );
              }
            },
            createPost: (_result, _args, cache, _info) => {
              invalidateScreenData(cache);
            },
            logout: (_result, _args, cache, _info) => {
              // once logged out we will return the me query null
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, _args, cache, _info) => {
              // while logging in
              // populate the me query
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateScreenData(cache);
            },
            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
