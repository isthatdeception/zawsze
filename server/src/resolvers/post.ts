// static imports
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

// relative imports
import { MyContext } from "../types";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  // read posts
  @Query(() => [Post]) // graphql type
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // reading a specific one
  @Query(() => Post, { nullable: true })
  post(
    @Arg("_id", () => Int) _id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { _id });
  }

  // create post
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("_id") _id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { _id });
    // if for some reason we didnot find the post return null
    if (!post) {
      return null;
    }
    // and if the title of the post is not undefined we just presist the new values
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  // delete post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("_id") _id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    // deleting the one post with the same _id
    await em.nativeDelete(Post, { _id });
    return true;
  }
}
