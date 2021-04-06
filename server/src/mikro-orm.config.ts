// static import
import { MikroORM } from "@mikro-orm/core";
import path from "path";

// relative import
import { DB_NAME, DB_PASSWORD, DB_TYPE, DB_USER, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
  // default values:
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    disableForeignKeys: false, // this is to not disabling foriegn keys
  },

  entities: [Post, User],
  dbName: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  type: DB_TYPE,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
