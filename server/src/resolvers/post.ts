// static imports

import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";

// relative imports
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver(Post)
export class PostResolver {
  // read posts
  @Query(() => [Post]) // graphql type
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    // a limit for our pagination
    const realLimit = Math.min(50, limit);

    // querybuilder
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")

      .orderBy('"createdAt"', "DESC")
      .take(realLimit);

    // if there is a cursor we will paginate the data
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    return qb.getMany();
  }

  // reading a specific one
  @Query(() => Post, { nullable: true })
  post(@Arg("_id", () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id);
  }

  // slicing the long posts so that one content doesnot take up all the space of
  // app and its post
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100);
  }

  // create post""
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
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
