import { Schema, model } from 'mongoose';

import { IUserRank } from '../types/user-rank.type';

export const userRankScheme = new Schema<IUserRank>(
  {
    userId: { ref: 'User', type: 'ObjectId' },
    partyRankId: { ref: 'PartyRank', type: 'ObjectId', index: true },
    favoriteId: { ref: 'PartyRankItem', type: 'ObjectId' },
    ranks: {
      type: Map,
      of: new Schema({
        value: Number,
      }),
    },
  },
  { collection: 'userRanks' },
);

userRankScheme.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

userRankScheme.set('toObject', { virtuals: true });
userRankScheme.set('toJSON', { virtuals: true });

userRankScheme.index({ partyRankId: 1, userId: 1 }, { unique: true });

export const UserRankModel = model('UserRank', userRankScheme);
