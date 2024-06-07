import { AppUser } from './app-user.interface';

export enum PartyRankStatus {
  Ongoing = 'ongoing',
  Registration = 'registration',
  Rating = 'rating',
  Finished = 'finished',
}

export interface PartyRank {
  id: string;
  creatorId: string;
  moderators: string[];
  members?: string[];
  creator: AppUser;
  name: string;
  requiredQuantity: number;
  deadlineDate: string;
  finishDate: string;
  status: PartyRankStatus;
  createdDate: string;
  finishedDate?: string;
  showTable: boolean;
  allowComments: boolean;
  content: string;
}
