import { Schema, model } from 'mongoose';

import { IPartyRankItem, IRankItemComment, RankItemType } from '../types';

export const partyRankItemScheme = new Schema<IPartyRankItem>(
  {
    partyRankId: { ref: 'User', type: 'ObjectId', index: true },
    authorId: { ref: 'User', type: 'ObjectId' },
    name: String,
    startTime: Number,
    type: {
      type: String,
      enum: Object.values(RankItemType),
    },
    value: String,
    comments: [
      new Schema<IRankItemComment>({
        authorId: { ref: 'User', type: 'ObjectId' },
        body: String,
      }),
    ],
    metadata: {
      type: Map,
      of: String,
    },
  },
  { collection: 'partyItems' },
);

partyRankItemScheme.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

partyRankItemScheme.set('toObject', { virtuals: true });
partyRankItemScheme.set('toJSON', { virtuals: true });

export const PartyRankItemModel = model('PartyRankItem', partyRankItemScheme);
