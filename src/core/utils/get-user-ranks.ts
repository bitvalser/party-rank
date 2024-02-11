import { UserRank } from '../interfaces/user-rank.interface';

export const getUserRanksFromResult = (userRank: UserRank): UserRank => {
  const { favoriteId, uid, authorId, author, ...rest } = userRank;
  return rest;
};
