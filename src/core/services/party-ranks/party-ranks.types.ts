import { BehaviorSubject, Observable } from 'rxjs';

import { AppUser } from '../../interfaces/app-user.interface';
import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
import { UserRank } from '../../interfaces/user-rank.interface';

export interface IPartyRanks {
  parties$: BehaviorSubject<Record<string, PartyRank>>;
  partyItems$: BehaviorSubject<Record<string, RankItem>>;
  createPartyRank(payload: Omit<PartyRank, 'creator' | 'creatorId' | 'id' | 'createdDate'>): Observable<PartyRank>;
  updatePartyRank(id: string, payload: Partial<Omit<PartyRank, 'creator' | 'creatorId' | 'id'>>): Observable<PartyRank>;
  getParties(): Observable<PartyRank[]>;
  getPartyRank(id: string): Observable<PartyRank>;
  addRankItem(partyId: string, payload: Omit<RankItem, 'id' | 'author' | 'authorId'>): Observable<RankItem>;
  getRankItems(partyId: string): Observable<RankItem[]>;
  deleteRankItem(partyId: string, id: string): Observable<void>;
  getUserRank(partyId: string): Observable<UserRank>;
  updateUserRank(partyId: string, payload: Partial<UserRank>): Observable<void>;
  getUserRanks(
    partyId: string,
    options?: { includeUser?: boolean },
  ): Observable<(UserRank & { uid: string; author?: AppUser })[]>;
}
