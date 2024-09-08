import { UserRank } from '../interfaces/user-rank.interface';

export const getUserRanksFromResult = (userRank: UserRank): UserRank['ranks'] => {
  return userRank?.ranks ?? {};
};
