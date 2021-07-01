/** this file is for types */

// static imports
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

// relative import
import { createPostCreatorLoader } from "./utils/postCreatorLoader";
import { createUpdooStatusLoader } from "./utils/updooStatusLoader";

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  res: Response;
  redis: Redis;
  postCreatorLoader: ReturnType<typeof createPostCreatorLoader>;
  updooStatusLoader: ReturnType<typeof createUpdooStatusLoader>;
};
