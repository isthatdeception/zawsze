// static imports
import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
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
} from "../generated/graphql";

// for all unauthenticated errors
// redirecting them to the login page for thier verification
export const errorExchange: Exchange = ({ forward }) => (ops$) => {
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

export const createUrqlClient = (ssrExchange: any) => ({
  url: process.env.API_URL!,
  fetchOptions: {
    credentials: "include" as const,
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
          // logging out the user
          logout: (_result, _args, cache, _info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null }) // returning null
            );
          },

          // we want to change the cache when we login the user
          login: (_result, _args, cache, _info) => {
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
          },
          // we want to change the cache when we register the user
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
});
