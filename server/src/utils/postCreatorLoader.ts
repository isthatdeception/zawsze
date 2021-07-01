// static imports
import DataLoader from "dataloader";

// relative imports
import { User } from "../entities/User";

/**
 * post-creator is loaded as an array so that one will not have to make multiple requests
 * to the server
 *
 * @returns users with userId as an array
 */
export const createPostCreatorLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });

    const usersThatNeedToBeShown = userIds.map(
      (userId) => userIdToUser[userId]
    );

    console.log(`usersThatNeedToBeShown in console ${usersThatNeedToBeShown}`);
    console.log(`users in the console: ${users}`);
    console.log(`userIdToUser : ${userIdToUser}`);
    return usersThatNeedToBeShown;
  });
