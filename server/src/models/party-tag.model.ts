import { Schema, model } from 'mongoose';

import { IPartyTag } from '../types/tag.type';

export const partyTagScheme = new Schema<IPartyTag>(
  {
    name: String,
    color: String,
  },
  { collection: 'tags' },
);

export const PartyTagModel = model('PartyTag', partyTagScheme);
