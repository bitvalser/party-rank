import { Types } from 'mongoose';

import { IUser } from './user.type';

export enum RankItemType {
  Video = 'video',
  Audio = 'audio',
  Image = 'image',
  YouTube = 'youtube',
}

export interface IRankItemComment {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
}

export interface IPartyRankItem {
  partyRankId: Types.ObjectId;
  authorId: Types.ObjectId;
  author?: IUser;
  type: RankItemType;
  name: string;
  value: string;
  startTime: number;
  comments?: Types.DocumentArray<IRankItemComment>;
  metadata?: Map<string, string>;
}
