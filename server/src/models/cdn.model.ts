import { Schema, model } from 'mongoose';

import { ICdnItem } from '../types/cdn.type';

export const DEFAULT_CDN_UPLOAD_LIMIT = 60;

export const cdnScheme = new Schema<ICdnItem>(
  {
    userId: { type: 'ObjectId', ref: 'User', index: true, unique: true },
    uploadLimit: { type: Number, default: DEFAULT_CDN_UPLOAD_LIMIT, min: 1 },
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
