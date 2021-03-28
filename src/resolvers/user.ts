// static imports
import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
} from "type-graphql";
import agron2 from "argon2";

// relative imports
import { MyContext } from "../types";
import { User } from "../entities/User";

// as an object type
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // register
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // error handling for regsiteration
    if (options.username.length <= 3) {
      return {
        errors: [
          {
            field: "username",
            message: "username must be at least 4 characters long",
          },
        ],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be atleast 6 characters long",
          },
        ],
      };
    }

    // if none of the above conditon does not get triggered
    // then the user has put valid credentials for our server to register him
    // here we will presist the user
    const hashedPassword = await agron2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    // if the user registers with the same credentiials then we have to handle it
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      console.log("message: ", err.message);
      // if error includes err.detail.includes("already exists")
      // 'duplicate username

      if (err.code === "23505") {
        // error has put username of the same value
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    // if user not found
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "this username doesn't exist",
          },
        ],
      };
    }
    const valid = await agron2.verify(user.password, options.password);
    // if user did not put valid credentials by using wrong password
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }
    return {
      user,
    };
  }
}
