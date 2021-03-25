// main file

// static imports
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

// env
import dotenv from "dotenv";
dotenv.config();

// relative import
import { __prod__ } from "./constants";
import config from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

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

  const apolloServer = new ApolloServer({
    // graphql schema
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false, // here we are not using class validator
    }),
    // helps to talk to all the resolvers
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server started running at server port");
  });
};

server().catch((err) => console.log(err));
