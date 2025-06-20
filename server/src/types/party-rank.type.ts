import { Types } from 'mongoose';

import { IUser } from './user.type';

export enum PartyRankStatus {
  Ongoing = 'ongoing',
  Registration = 'registration',
  Rating = 'rating',
  Finished = 'finished',
}

export interface IPartyRankFilters {
  name?: string;
  creatorId?: string;
  isParticipant?: boolean;
  active?: boolean;
  myPartyRanks?: boolean;
  tags?: string[];
}

export interface IPartyRank {
  creatorId: Types.ObjectId;
  creator?: IUser;
  members?: IUser[];
  moderators?: IUser[];
  itemsOrder?: string[];
  moderatorIds: Types.ObjectId[];
  memberIds?: Types.ObjectId[];
  name: string;
  requiredQuantity: number;
  deadlineDate: Date;
  finishDate: Date;
  tags: string[];
  status: PartyRankStatus;
  createdDate: Date;
  finishedDate: Date;
  showTable: boolean;
  isPrivate: boolean;
  allowComments: boolean;
  content: string;
  discordIntegrationId?: Types.ObjectId;
}
