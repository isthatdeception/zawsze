import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FieldError = {
  __typename?: "FieldError";
  field: Scalars["String"];
  message: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  vote: Scalars["Boolean"];
  createPost: Post;
  updatePost?: Maybe<Post>;
  deletePost: Scalars["Boolean"];
  changePassword: UserResponse;
  forgotPassword: Scalars["Boolean"];
  register: UserResponse;
  login: UserResponse;
  logout: Scalars["Boolean"];
};

export type MutationVoteArgs = {
  value: Scalars["Int"];
  postId: Scalars["Int"];
};

export type MutationCreatePostArgs = {
  input: PostInput;
};

export type MutationUpdatePostArgs = {
  text: Scalars["String"];
  title: Scalars["String"];
  id: Scalars["Float"];
};

export type MutationDeletePostArgs = {
  id: Scalars["Float"];
};

export type MutationChangePasswordArgs = {
  newPassword: Scalars["String"];
  token: Scalars["String"];
};

export type MutationForgotPasswordArgs = {
  email: Scalars["String"];
};

export type MutationRegisterArgs = {
  options: UsernamePasswordInput;
};

export type MutationLoginArgs = {
  password: Scalars["String"];
  usernameOrEmail: Scalars["String"];
};

export type PaginatedPosts = {
  __typename?: "PaginatedPosts";
  posts: Array<Post>;
  hasMore: Scalars["Boolean"];
};

export type Post = {
  __typename?: "Post";
  id: Scalars["Int"];
  title: Scalars["String"];
  text: Scalars["String"];
  zpoints: Scalars["Float"];
  voteStatus?: Maybe<Scalars["Int"]>;
  creatorId: Scalars["Float"];
  creator: User;
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
  textSnippet: Scalars["String"];
};

export type PostInput = {
  title: Scalars["String"];
  text: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  hello: Scalars["String"];
  posts: PaginatedPosts;
  post?: Maybe<Post>;
  me?: Maybe<User>;
};

export type QueryPostsArgs = {
  cursor?: Maybe<Scalars["String"]>;
  limit: Scalars["Int"];
};

export type QueryPostArgs = {
  id: Scalars["Int"];
};

export type User = {
  __typename?: "User";
  id: Scalars["Int"];
  username: Scalars["String"];
  email: Scalars["String"];
  createdAt: Scalars["String"];
  updatedAt: Scalars["String"];
};

export type UserResponse = {
  __typename?: "UserResponse";
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UsernamePasswordInput = {
  username: Scalars["String"];
  password: Scalars["String"];
  email: Scalars["String"];
};

export type ErrorInfoFragment = { __typename?: "FieldError" } & Pick<
  FieldError,
  "field" | "message"
>;

export type PostSnippetFragment = { __typename?: "Post" } & Pick<
  Post,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "textSnippet"
  | "creatorId"
  | "voteStatus"
  | "zpoints"
> & {
    creator: { __typename?: "User" } & Pick<
      User,
      "id" | "username" | "createdAt" | "updatedAt" | "email"
    >;
  };

export type UserInfoFragment = { __typename?: "User" } & Pick<
  User,
  "id" | "username"
>;

export type UserResponseInfoFragment = { __typename?: "UserResponse" } & {
  errors?: Maybe<Array<{ __typename?: "FieldError" } & ErrorInfoFragment>>;
  user?: Maybe<{ __typename?: "User" } & UserInfoFragment>;
};

export type ChangePasswordMutationVariables = Exact<{
  token: Scalars["String"];
  newPassword: Scalars["String"];
}>;

export type ChangePasswordMutation = { __typename?: "Mutation" } & {
  changePassword: { __typename?: "UserResponse" } & UserResponseInfoFragment;
};

export type CreatePostMutationVariables = Exact<{
  input: PostInput;
}>;

export type CreatePostMutation = { __typename?: "Mutation" } & {
  createPost: { __typename?: "Post" } & Pick<
    Post,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "title"
    | "text"
    | "creatorId"
    | "zpoints"
  >;
};

export type DeletePostMutationVariables = Exact<{
  id: Scalars["Float"];
}>;

export type DeletePostMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "deletePost"
>;

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars["String"];
}>;

export type ForgotPasswordMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "forgotPassword"
>;

export type LoginMutationVariables = Exact<{
  usernameOrEmail: Scalars["String"];
  password: Scalars["String"];
}>;

export type LoginMutation = { __typename?: "Mutation" } & {
  login: { __typename?: "UserResponse" } & UserResponseInfoFragment;
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: "Mutation" } & Pick<
  Mutation,
  "logout"
>;

export type RegisterMutationVariables = Exact<{
  options: UsernamePasswordInput;
}>;

export type RegisterMutation = { __typename?: "Mutation" } & {
  register: { __typename?: "UserResponse" } & UserResponseInfoFragment;
};

export type UpdatePostMutationVariables = Exact<{
  id: Scalars["Float"];
  title: Scalars["String"];
  text: Scalars["String"];
}>;

export type UpdatePostMutation = { __typename?: "Mutation" } & {
  updatePost?: Maybe<
    { __typename?: "Post" } & Pick<
      Post,
      "id" | "title" | "text" | "textSnippet"
    >
  >;
};

export type VoteMutationVariables = Exact<{
  value: Scalars["Int"];
  postId: Scalars["Int"];
}>;

export type VoteMutation = { __typename?: "Mutation" } & Pick<Mutation, "vote">;

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: "Query" } & {
  me?: Maybe<{ __typename?: "User" } & UserInfoFragment>;
};

export type PostQueryVariables = Exact<{
  id: Scalars["Int"];
}>;

export type PostQuery = { __typename?: "Query" } & {
  post?: Maybe<
    { __typename?: "Post" } & Pick<
      Post,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "title"
      | "text"
      | "creatorId"
      | "voteStatus"
      | "zpoints"
    > & {
        creator: { __typename?: "User" } & Pick<
          User,
          "id" | "username" | "email" | "createdAt" | "updatedAt"
        >;
      }
  >;
};

export type PostsQueryVariables = Exact<{
  limit: Scalars["Int"];
  cursor?: Maybe<Scalars["String"]>;
}>;

export type PostsQuery = { __typename?: "Query" } & {
  posts: { __typename?: "PaginatedPosts" } & Pick<PaginatedPosts, "hasMore"> & {
      posts: Array<{ __typename?: "Post" } & PostSnippetFragment>;
    };
};

export const PostSnippetFragmentDoc = gql`
  fragment postSnippet on Post {
    id
    createdAt
    updatedAt
    title
    textSnippet
    creatorId
    voteStatus
    zpoints
    creator {
      id
      username
      createdAt
      updatedAt
      email
    }
  }
`;
export const ErrorInfoFragmentDoc = gql`
  fragment errorInfo on FieldError {
    field
    message
  }
`;
export const UserInfoFragmentDoc = gql`
  fragment userInfo on User {
    id
    username
  }
`;
export const UserResponseInfoFragmentDoc = gql`
  fragment userResponseInfo on UserResponse {
    errors {
      ...errorInfo
    }
    user {
      ...userInfo
    }
  }
  ${ErrorInfoFragmentDoc}
  ${UserInfoFragmentDoc}
`;
export const ChangePasswordDocument = gql`
  mutation ChangePassword($token: String!, $newPassword: String!) {
    changePassword(token: $token, newPassword: $newPassword) {
      ...userResponseInfo
    }
  }
  ${UserResponseInfoFragmentDoc}
`;

export function useChangePasswordMutation() {
  return Urql.useMutation<
    ChangePasswordMutation,
    ChangePasswordMutationVariables
  >(ChangePasswordDocument);
}
export const CreatePostDocument = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      id
      createdAt
      updatedAt
      title
      text
      creatorId
      zpoints
    }
  }
`;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(
    CreatePostDocument
  );
}
export const DeletePostDocument = gql`
  mutation DeletePost($id: Float!) {
    deletePost(id: $id)
  }
`;

export function useDeletePostMutation() {
  return Urql.useMutation<DeletePostMutation, DeletePostMutationVariables>(
    DeletePostDocument
  );
}
export const ForgotPasswordDocument = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export function useForgotPasswordMutation() {
  return Urql.useMutation<
    ForgotPasswordMutation,
    ForgotPasswordMutationVariables
  >(ForgotPasswordDocument);
}
export const LoginDocument = gql`
  mutation Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      ...userResponseInfo
    }
  }
  ${UserResponseInfoFragmentDoc}
`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
}
export const LogoutDocument = gql`
  mutation Logout {
    logout
  }
`;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument
  );
}
export const RegisterDocument = gql`
  mutation Register($options: UsernamePasswordInput!) {
    register(options: $options) {
      ...userResponseInfo
    }
  }
  ${UserResponseInfoFragmentDoc}
`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(
    RegisterDocument
  );
}
export const UpdatePostDocument = gql`
  mutation UpdatePost($id: Float!, $title: String!, $text: String!) {
    updatePost(id: $id, title: $title, text: $text) {
      id
      title
      text
      textSnippet
    }
  }
`;

export function useUpdatePostMutation() {
  return Urql.useMutation<UpdatePostMutation, UpdatePostMutationVariables>(
    UpdatePostDocument
  );
}
export const VoteDocument = gql`
  mutation Vote($value: Int!, $postId: Int!) {
    vote(value: $value, postId: $postId)
  }
`;

export function useVoteMutation() {
  return Urql.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument);
}
export const MeDocument = gql`
  query Me {
    me {
      ...userInfo
    }
  }
  ${UserInfoFragmentDoc}
`;

export function useMeQuery(
  options: Omit<Urql.UseQueryArgs<MeQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
}
export const PostDocument = gql`
  query Post($id: Int!) {
    post(id: $id) {
      id
      createdAt
      updatedAt
      title
      text
      creatorId
      voteStatus
      zpoints
      creator {
        id
        username
        email
        createdAt
        updatedAt
      }
    }
  }
`;

export function usePostQuery(
  options: Omit<Urql.UseQueryArgs<PostQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<PostQuery>({ query: PostDocument, ...options });
}
export const PostsDocument = gql`
  query Posts($limit: Int!, $cursor: String) {
    posts(limit: $limit, cursor: $cursor) {
      hasMore
      posts {
        ...postSnippet
      }
    }
  }
  ${PostSnippetFragmentDoc}
`;

export function usePostsQuery(
  options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
}
