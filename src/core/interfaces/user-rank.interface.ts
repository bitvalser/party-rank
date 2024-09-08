import { AppUser } from './app-user.interface';

export interface UserRank {
  userId: string;
  partyRankId: string;
  favoriteId?: string;
  author?: AppUser;
  ranks: {
    [key: string]: { value: number } | any;
  };
}
