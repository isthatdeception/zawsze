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
          where _id = $2
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
        where _id = $2
  
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

  // read posts
  @Query(() => PaginatedPosts) // graphql type
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    /**
     *  if our limit is 50 then we will fetch 51 so that
     *  we can track when extra posts are available to show to our users
     *
     *  hasmore just ensures we will not show the load more button if we get out of the posts
     *  to show to our user
     *
     *  50 -> 51 if exists then hasMore is true
     *  loadmore button will show
     *
     *  after that we will show the user all the posts within the real limit as
     *  it was supposed to
     */

    // a limit for our pagination
    const realLimit = Math.min(50, limit);
    const paginatedLimit = realLimit + 1;

    const substitutes: any[] = [paginatedLimit];

    // if there is a user we will push it to our query
    if (req.session.userId) {
      substitutes.push(req.session.userId);
    }

    // if there is a cursor paginate the data
    let cursorIndex = 3;
    if (cursor) {
      substitutes.push(new Date(parseInt(cursor)));
      cursorIndex = substitutes.length;
    }

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator,
      ${
        req.session.userId
          ? `(select value from updoo where "userId" = $2 and "postId" = p._id) "voteStatus"`
          : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u._id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      substitutes
    );

    console.log(posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === paginatedLimit,
    }; // hasmore: true
  }

  // reading a specific one
  // and fetching all the sub contents that are neccessary for our page
  @Query(() => Post, { nullable: true })
  async post(@Arg("_id", () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id, { relations: ["creator"] });
    // const readPost = await Post.findOne(_id, { relations: ["creator"] });
    // return readPost;
    // return Post.findOneOrFail(_id, { relations: ["creator"] });
    // const singlepost = await Post.findOneOrFail(_id, {
    //   relations: ["creator"],
    // });
    // console.log(singlepost);
    // return singlepost;

    // const post = await getConnection()
    //   .createQueryBuilder()
    //   .relation(Post, "creator")
    //   .of(_id) // you can use just post id as well
    //   .loadOne();

    // return post;
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
