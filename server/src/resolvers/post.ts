// static imports
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

// relative imports

import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  // read posts
  @Query(() => [Post]) // graphql type
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  // reading a specific one
  @Query(() => Post, { nullable: true })
  post(@Arg("_id", () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id);
  }

  // create post
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  // update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("_id") _id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { _id } });
    // if for some reason we didnot find the post return null
    if (!post) {
      return null;
    }
    // and if the title of the post is not undefined we just presist the new values
    if (typeof title !== "undefined") {
      Post.update({ _id }, { title });
    }
    return post;
  }

  // delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg("_id") _id: number): Promise<boolean> {
    // deleting the one post with the same _id
    await Post.delete(_id);
    return true;
  }
}
