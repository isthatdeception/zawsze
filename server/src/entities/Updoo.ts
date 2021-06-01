/**
 * up-down operations
 *
 * m-n relationship i.e
 * many to many relationship
 *
 * for voting
 * users <--> posts
 * users --> updoo <-- posts
 * users --> joins table <-- posts
 */

// static imports
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

// relative imports
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoo extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoos)
  user: User;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoos, { onDelete: "CASCADE" })
  post: Post;
}
