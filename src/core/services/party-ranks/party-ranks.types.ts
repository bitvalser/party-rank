import { BehaviorSubject, Observable } from 'rxjs';

import { AppUser } from '../../interfaces/app-user.interface';
import { FirebaseFetchOptions } from '../../interfaces/firebase-options.interface';
import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
import { UserRank } from '../../interfaces/user-rank.interface';

export interface IPartyRanks {
  parties$: BehaviorSubject<Record<string, PartyRank>>;
  partyItems$: BehaviorSubject<Record<string, RankItem>>;
  createPartyRank(
    payload: Omit<PartyRank, 'creator' | 'creatorId' | 'id' | 'createdDate' | 'members'>,
  ): Observable<PartyRank>;
  updatePartyRank(id: string, payload: Partial<Omit<PartyRank, 'creator' | 'creatorId' | 'id'>>): Observable<PartyRank>;
  registerToPartyRank(id: string): Observable<PartyRank>;
  removeUserRegistration(id: string, userId: string): Observable<PartyRank>;
  addUserRegistration(id: string, userId: string): Observable<PartyRank>;
  deletePartyRank(id: string): Observable<void>;
  getParties(): Observable<PartyRank[]>;
  getPartyRank(id: string): Observable<PartyRank>;
  addRankItem(partyId: string, payload: Omit<RankItem, 'id' | 'author' | 'authorId'>): Observable<RankItem>;
  getRankItems(partyId: string, options?: FirebaseFetchOptions): Observable<RankItem[]>;
  deleteRankItem(partyId: string, id: string): Observable<void>;
  getUserRank(partyId: string): Observable<UserRank>;
  updateUserRank(partyId: string, payload: Partial<UserRank>): Observable<void>;
  deleteUserRank(partyId: string, uid: string): Observable<void>;
  updateRankItem(
    partyId: string,
    itemId: string,
    payload: Partial<Omit<RankItem, 'id' | 'authorId' | 'author'>>,
  ): Observable<RankItem>;
  getUserRanks(
    partyId: string,
    options?: { includeUser?: boolean } & FirebaseFetchOptions,
  ): Observable<(UserRank & { uid: string; author?: AppUser })[]>;
}
