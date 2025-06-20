import { AppUser } from './app-user.interface';

export enum PartyRankStatus {
  Ongoing = 'ongoing',
  Registration = 'registration',
  Rating = 'rating',
  Finished = 'finished',
}

export interface PartyRank {
  _id: string;
  creatorId: string;
  moderatorIds: string[];
  memberIds: string[];
  itemsOrder?: string[];
  moderators?: AppUser[];
  members?: AppUser[];
  creator?: AppUser;
  name: string;
  tags: string[];
  requiredQuantity: number;
  deadlineDate: string;
  finishDate: string;
  status: PartyRankStatus;
  createdDate: string;
  finishedDate?: string;
  showTable: boolean;
  allowComments: boolean;
  isPrivate: boolean;
  content: string;
}
