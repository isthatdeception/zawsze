// static imports
import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import agron2 from "argon2";
// import { EntityManager } from "@mikro-orm/postgresql";

// relative imports
import { MyContext } from "../types";
import { User } from "../entities/User";
import { COOKIE_NAME } from "../constants";

// as an object type
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
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
  // forgotten password
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    const user = await em.findOne(User, { email });

    // not found
    if (!user) {
      // user is not in db
      return true; // for security purposes
    }

    return true;
  }

  // me query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    console.log(req.session);
    // if not logged in return null
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { _id: req.session.userId });
    return user;
  }

  // register
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
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

    // to make sure that one cannot have @ sign in thier username
    // for our validation to work
    if (options.username.includes("@")) {
      return {
        errors: [
          {
            field: "username",
            message: "username cannot have an @ sign",
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

    // for email validation
    if (!options.email.includes("@")) {
      return {
        errors: [
          {
            field: "email",
            message: "invalid email",
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
      email: options.email,
      password: hashedPassword,
    });

    // let user
    // if the user registers with the same credentiials then we have to handle it
    try {
      // query builder
      // for implicit behaviour with our server
      // const result = (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({
      //     username: options.username,
      //     password: hashedPassword,
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   })
      //   .returning("*");

      // user = result[0];
      await em.persistAndFlush(user);
    } catch (err) {
      console.log("message: ", err.message);
      // err.code did not worked so i just did err.detail.includes('already taken')
      // duplicate username

      // if (err.detail.includes("already exits")) {
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

    // after the user has successfully reggistered we consider hin logged in
    // so neing friendly
    // store user id session
    // this will set a cookie for the user
    // so that still interact with the site
    req.session.userId = user._id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    // @Arg("options") options: UsernamePasswordInput,
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    // if user not found
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "this username or email doesn't exist",
          },
        ],
      };
    }
    const valid = await agron2.verify(user.password, password);
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

    // presisting the user session
    req.session!.userId = user._id;

    return {
      user,
    };
  }

  // logout functionality
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    // redis
    // when clicked on logout on frontend
    // we are gonna wait for this promise to finish
    return new Promise((resolve) =>
      // and the promise is gonna wait for this callback to be finished
      // ***
      // destroying the session token which we saved on the server
      req.session.destroy((err) => {
        if (err) {
          // if met ah error in doing logging out sent a false
          console.log(err);
          resolve(false);
          return;
        }
        console.log("logged out successfully");
        // clearing the local storage session on the browser
        res.clearCookie(COOKIE_NAME);
        // otherwise true
        resolve(true);
      })
    );
  }
}
