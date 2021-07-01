// static imports
import DataLoader from "dataloader";

// relative imports
import { Updoo } from "../entities/Updoo";

/**
 * updoo represents up-down operations that happens in our post
 * this function loads the value of updoo which can be a number or null
 * by default the value of updoo is 0
 *
 * it also returns as a part of the upddo entity
 *
 * function need two keys as to evaluate votes on the posts
 * postId and userId which combinied is responsible for updoo
 * @returns key : value pair
 */
export const createUpdooStatusLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoo | null>(
    async (keys) => {
      const updoos = await Updoo.findByIds(keys as any);
      const updoosIdsToUpdoo: Record<string, Updoo> = {};

      updoos.forEach((updoo) => {
        updoosIdsToUpdoo[`${updoo.userId}|${updoo.postId}`] = updoo;
      });

      const updooStatusOnPost = keys.map(
        (key) => updoosIdsToUpdoo[`${key.userId}|${key.postId}`]
      );

      console.log(`updoos that needs to be fixed ${updooStatusOnPost}`);
      return updooStatusOnPost;
    }
  );
