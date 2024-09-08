import { AppUser } from './app-user.interface';

export enum RankItemType {
  Video = 'video',
  Audio = 'audio',
  Image = 'image',
  YouTube = 'youtube',
}

export interface RankItemComment {
  _id: string;
  authorId: string;
  body: string;
}

export interface RankItem {
  _id: string;
  partyRankId: string;
  authorId: string;
  author: AppUser;
  type: RankItemType;
  name: string;
  value: string;
  startTime: number;
  comments?: RankItemComment[];
  metadata?: Record<string, string>;
}
