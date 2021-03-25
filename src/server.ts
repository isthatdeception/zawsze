// main file

// static imports
import { MikroORM } from "@mikro-orm/core";

// env
import dotenv from "dotenv";
dotenv.config();

// relative import
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import config from "./mikro-orm.config";

const server = async () => {
  // database connnection
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up(); // automating the migration process

  // // post
  const post = orm.em.create(Post, { title: "first post!" });
  await orm.em.persistAndFlush(post);

  // // just a console.log for separating these 2
  console.log("------------sql2------------");

  const posts = await orm.em.find(Post, {});
  console.log(posts);
};

server().catch((err) => console.log(err));
