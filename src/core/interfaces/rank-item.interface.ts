import { AppUser } from './app-user.interface';

export enum RankItemType {
  Video = 'video',
  Audio = 'audio',
  Image = 'image',
  YouTube = 'youtube',
}

export interface RankItemComment {
  id: string;
  authorId: string;
  body: string;
}

export interface RankItem {
  id: string;
  authorId: string;
  author: AppUser;
  type: RankItemType;
  name: string;
  value: string;
  startTime: number;
  comments?: RankItemComment[];
}
