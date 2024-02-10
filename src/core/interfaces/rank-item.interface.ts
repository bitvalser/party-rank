import { AppUser } from './app-user.interface';

export enum RankItemType {
  Video = 'video',
  Audio = 'audio',
  Image = 'image',
  YouTube = 'youtube',
}

export interface RankItem {
  id: string;
  authorId: string;
  author: AppUser;
  type: RankItemType;
  name: string;
  value: string;
}
