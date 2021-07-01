// static imports

import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
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
import { Updoo } from "../entities/Updoo";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

/**
 * function resolves query and requests to every post related requests
 *
 */
@Resolver(Post)
export class PostResolver {
  // voting on a post
  // and checking the user is logged in
  // only then he is authorized to vote
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoo = value !== -1;
    const absoluteValue = isUpdoo ? 1 : -1;
    const { userId } = req.session;

    const updoo = await Updoo.findOne({ where: { postId, userId } });

    if (updoo && updoo.value !== absoluteValue) {
      // if the user has posted on the post before
      // and they are changing their vote
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update updoo
          set value = $1
          where "postId" = $2 and "userId" = $3
        `,
          [absoluteValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set zpoints = zpoints + $1
          where id = $2
        `,
          [2 * absoluteValue, postId]
        );
      });
    } else if (!updoo) {
      // if the user
      // has never voted before
      // on the post
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        insert into updoo ("userId", "postId", value)
        values ($1, $2, $3);
        `,
          [userId, postId, absoluteValue]
        );

        await tm.query(
          `
        update post
        set zpoints = zpoints + $1
        where id = $2
  
        `,
          [absoluteValue, postId]
        );
      });
    }

    // await Updoo.insert({
    //   userId,
    //   postId,
    //   value: absoluteValue,
    // });

    return true;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { postCreatorLoader }: MyContext) {
    return postCreatorLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updooStatusLoader, req }: MyContext
  ) {
    /**
     * req.session.userId = user.id
     * this makes it look like that the user is valid and is active
     * if the user is not logged in
     * we will simply just return
     * so
     *
     * that updoo won't get requested from the server for the posts that are
     * not up voted or down voted yet
     */

    if (!req.session.userId) {
      console.log(`user not logged in or not found`);
      return;
    }

    const updoo = await updooStatusLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    console.log(`updoo in the console: ${updoo}`);

    return updoo ? updoo.value : null;
  }

  // read posts
  @Query(() => PaginatedPosts) // graphql type
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    /**
     *  if our limit is 50 then we will fetch 51 so that
     *  we can track when extra posts are available to show to our users
     *
     *  hasmore just ensures we will not show the load more button if we get out of the posts
     *  to show to our user
     *
     *  after that we will show the user all the posts within the real limit as
     *  it was supposed to
     */

    // a limit for our pagination
    const realLimit = Math.min(50, limit);
    const paginatedLimit = realLimit + 1;

    const substitutes: any[] = [paginatedLimit];

    // if there is a cursor paginate the data
    if (cursor) {
      substitutes.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.* 
     
      from post p
      
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      substitutes
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === paginatedLimit,
    }; // hasmore: true
  }

  // reading a specific one
  // and fetching all the sub contents that are neccessary for our page
  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // slicing the long posts so that one content doesnot take up all the space of
  // app and its post
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 150);
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
    @Arg("id") id: number,
    @Arg("title", () => String) title: string,
    @Arg("text", () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const updatedPost = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return updatedPost.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // using cascade on updoo entity
    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }

    await Post.delete({ id, creatorId: req.session.userId });

    return true;
  }
}
