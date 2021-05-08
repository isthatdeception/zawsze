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
    // await Updoo.insert({
    //   userId,
    //   postId,
    //   value: absoluteValue,
    // });

    getConnection().query(
      `
      START TRANSACTION;

      insert into updoo ("userId", "postId", value)
      values (${userId}, ${postId}, ${absoluteValue});

      update post
      set zpoints = zpoints + ${absoluteValue}
      where _id = ${postId};

      COMMIT;      

    `
    );

    return true;
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
     *  50 -> 51 if exists then hasMore is true
     *  loadmore button will show
     *
     *  after that we will show the user all the posts within the real limit as
     *  it was supposed to
     */

    // a limit for our pagination
    const realLimit = Math.min(50, limit);
    const paginatedLimit = realLimit + 1;

    const justPaginate: any[] = [paginatedLimit];

    // if there is a cursor paginate the data
    if (cursor) {
      justPaginate.push(new Date(parseInt(cursor)));
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
        ) creator
      from post p
      inner join public.user u on u._id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      justPaginate
    );

    // querybuilder
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("post")

    //   .innerJoinAndSelect("post.creator", "user", 'user._id = post."creatorId"')
    //   .orderBy('post."createdAt"', "DESC")
    //   .take(paginatedLimit);

    // if there is a cursor we will paginate the data
    // if (cursor) {
    //   qb.where('post."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await qb.getMany();
    // console.log("posts: ", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === paginatedLimit,
    }; // hasmore: true
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
