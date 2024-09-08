import { BehaviorSubject, Observable } from 'rxjs';

import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
import { UserRank } from '../../interfaces/user-rank.interface';

export interface IPartyRanksFilters {
  name?: string;
  creatorId?: string;
  isParticipant?: boolean;
  active?: boolean;
  myPartyRanks?: boolean;
  tags?: string[];
}

export interface IItemsFilters {
  name?: string;
  tags?: string[];
}

export interface IPartyRanks {
  parties$: BehaviorSubject<Record<string, PartyRank>>;
  partyItems$: BehaviorSubject<Record<string, RankItem>>;
  createPartyRank(
    payload: Omit<
      PartyRank,
      'creator' | 'status' | 'memberIds' | 'finishedDate' | 'creatorId' | '_id' | 'createdDate' | 'members'
    >,
  ): Observable<PartyRank>;
  updatePartyRank(
    id: string,
    payload: Partial<
      Omit<PartyRank, 'creator' | 'memberIds' | 'finishedDate' | 'creatorId' | '_id' | 'createdDate' | 'members'>
    >,
  ): Observable<PartyRank>;
  registerToPartyRank(id: string): Observable<PartyRank>;
  removeUserRegistration(id: string, userId: string): Observable<PartyRank>;
  unregisterFromPartyRank(id: string): Observable<PartyRank>;
  addUserRegistration(id: string, userId: string): Observable<PartyRank>;
  deletePartyRank(id: string): Observable<void>;
  getParties(filters: Partial<IPartyRanksFilters>): Observable<PartyRank[]>;
  getPartyRank(id: string): Observable<PartyRank>;
  addRankItem(
    partyId: string,
    payload: Omit<RankItem, '_id' | 'author' | 'authorId' | 'partyRankId'>,
  ): Observable<RankItem>;
  getRankItems(partyId: string): Observable<RankItem[]>;
  deleteRankItem(id: string): Observable<void>;
  getUserRank(partyId: string): Observable<UserRank>;
  updateUserRank(partyId: string, payload: Partial<UserRank>): Observable<void>;
  deleteUserRank(partyId: string, uid: string): Observable<void>;
  updateRankItem(itemId: string, payload: Partial<Omit<RankItem, '_id' | 'authorId' | 'author'>>): Observable<RankItem>;
  getUserRanks(partyId: string, options?: { includeUser?: boolean }): Observable<UserRank[]>;
  searchItems(payload: {
    limit: number;
    offset: number;
    filters: IItemsFilters;
  }): Observable<{ count?: number; items: RankItem[] }>;
}
