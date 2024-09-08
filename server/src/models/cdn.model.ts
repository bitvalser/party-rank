import { Schema, model } from 'mongoose';

import { ICdnItem } from '../types/cdn.type';

export const cdnScheme = new Schema<ICdnItem>(
  {
    userId: { type: 'ObjectId', ref: 'User', index: true, unique: true },
    assets: {
      type: Map,
      of: new Schema({
        path: String,
        created: Date,
        name: String,
        id: String,
        url: String,
      }),
    },
  },
  { collection: 'cdn' },
);

cdnScheme.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

cdnScheme.set('toObject', { virtuals: true });
cdnScheme.set('toJSON', { virtuals: true });

export const CdnItemModel = model('CdnItem', cdnScheme);
