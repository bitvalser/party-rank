import { Types } from 'mongoose';

export interface IUserRank {
  userId: Types.ObjectId;
  partyRankId: Types.ObjectId;
  favoriteId: Types.ObjectId;
  ranks: Map<string, { value: number }>;
}
