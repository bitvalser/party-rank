import { PartyRank } from './party-rank.interface';

export enum UserRole {
  Creator = 'creator',
  Regular = 'regular',
}

export interface AppUser {
  _id: string;
  photoURL: string;
  displayName: string;
  role: UserRole;
}

export interface UserProfile {
  profile: AppUser & {
    discordId: string;
  };
  allRanks: number[];
  ranksByPartyId: Record<string, number[]>;
  parties: PartyRank[];
}
