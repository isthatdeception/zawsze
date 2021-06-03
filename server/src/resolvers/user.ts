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
  FieldResolver,
  Root,
} from "type-graphql";
import agron2 from "argon2";
import { v4 as uuidv4 } from "uuid";

// import { EntityManager } from "@mikro-orm/postgresql";

// relative imports
import { MyContext } from "../types";
import { User } from "../entities/User";
import { CLIENT_URL, COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";

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

@Resolver(User)
export class UserResolver {
  // email should be hidden for other users.
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // if this is true
    // we will show the user thier id
    if (req.session.userId === user.id) {
      return user.email;
    }
    // if one is not the owner of the posts we will hide thier email address
    return "";
  }

  // change password
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    // checking that new password is valid or not
    // for consistency in our db
    if (newPassword.length <= 5) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password must be atleast 6 characters long",
          },
        ],
      };
    }

    // after checking the password is valid
    // we will ensure that token is valid and not expired
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    // if for some reason we still did not get the user
    // we might need some error checking for that
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    // if we got an user back then we will change the password
    // and hash it to the db

    await User.update(
      { id: userIdNum },
      { password: await agron2.hash(newPassword) }
    );

    // once we changed the password successfully
    // we will delete so this won't get used
    await redis.del(key);

    // login the user after changing the password
    // for which we need to immediately start that concerned user session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  // forgotten password
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    // not found
    if (!user) {
      // user is not in db
      return true; // for security purposes
    }

    // if there is a user and is in need to
    // get new credentials for an account we will
    // give them an email offering a link so that
    // one can change his password with the link which directs to our client side
    // with an specific secret token so that our server will recognize the user
    // and the valid token

    // this will give a random unique string
    // 783473djskad-ujdhs-323-kdskd

    // intializing the new token
    const token = uuidv4();

    // storing in the redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 10
    ); // 10 mins

    await sendEmail(
      email,
      `<a href="${CLIENT_URL}/change-password/${token}">reset-password</a>`
    );

    return true;
  }

  // me query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // if not logged in return null
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne(req.session.userId);
    return user;
  }

  // register
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
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

    let user;
    // if the user registers with the same credentiials then we have to handle it
    try {
      // typeorm query builder
      // we could also have done

      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      console.log("message: ", err.message);
      // err.code did not worked so i just did err.detail.includes('already taken')
      // duplicate username

      // if (err.detail.includes("already exits")) {
      console.log("err: ", err);
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
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    // @Arg("options") options: UsernamePasswordInput,
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
    req.session!.userId = user.id;

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
