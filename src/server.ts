// main file

// static imports
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

// env
import dotenv from "dotenv";
dotenv.config();

// relative import
import { __prod__ } from "./constants";
import config from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

const server = async () => {
  // database connnection
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up(); // automating the migration process

  // // post
  // const post = orm.em.create(Post, { title: "first post!" });
  // await orm.em.persistAndFlush(post);

  // // just a console.log for separating these 2
  // console.log("------------sql2------------");

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  const app = express();

  // redis for caching or presisting user sessions
  // redis initialize
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 10800000, // 3 hours that i.e 1000 * 3 * 60 * 60,
        httpOnly: true, // for not making available on the front end
        sameSite: "lax", // csrf
        secure: __prod__, // site can be only be accessible if it is https for true
      },
      saveUninitialized: false,
      secret: process.env.REDIS_SECRET_KEY!,
      resave: false,
    })
  );

  // apollo server will use sessions
  const apolloServer = new ApolloServer({
    // graphql schema
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false, // here we are not using class validator
    }),
    // helps to talk to all the resolvers
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server started running at server port");
  });
};

server().catch((err) => console.log(err));
