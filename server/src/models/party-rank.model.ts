import { Schema, model } from 'mongoose';

import { IPartyRank, PartyRankStatus } from '../types/party-rank.type';

export const partyRankScheme = new Schema<IPartyRank>(
  {
    status: {
      type: String,
      enum: Object.values(PartyRankStatus),
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
      default: '',
    },
    createdDate: Date,
    finishedDate: Date,
    creatorId: { type: 'ObjectId', ref: 'User' },
    deadlineDate: {
      type: Date,
      default: () => new Date(),
    },
    finishDate: {
      type: Date,
      default: () => new Date(),
    },
    memberIds: [{ type: 'ObjectId', ref: 'User', default: [] }],
    moderatorIds: [{ type: 'ObjectId', ref: 'User', default: [] }],
    name: {
      type: String,
      required: true,
    },
    showTable: {
      type: Boolean,
      default: false,
    },
    requiredQuantity: {
      type: Number,
      min: 0,
      max: 10,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'parties' },
);

partyRankScheme.virtual('creator', {
  ref: 'User',
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true,
});

partyRankScheme.virtual('members', {
  ref: 'User',
  localField: 'memberIds',
  foreignField: '_id',
});

partyRankScheme.virtual('moderators', {
  ref: 'User',
  localField: 'moderatorIds',
  foreignField: '_id',
});

partyRankScheme.set('toObject', { virtuals: true });
partyRankScheme.set('toJSON', { virtuals: true });

export const PartyRankModel = model('PartyRank', partyRankScheme);
