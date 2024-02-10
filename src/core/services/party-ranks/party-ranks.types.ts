import { BehaviorSubject, Observable } from 'rxjs';

import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';

export interface IPartyRanks {
  parties$: BehaviorSubject<Record<string, PartyRank>>;
  partyItems$: BehaviorSubject<Record<string, RankItem>>;
  createPartyRank(payload: Omit<PartyRank, 'creator' | 'creatorId' | 'id' | 'createdDate'>): Observable<PartyRank>;
  getParties(): Observable<PartyRank[]>;
  getPartyRank(id: string): Observable<PartyRank>;
  addRankItem(partyId: string, payload: Omit<RankItem, 'id' | 'author' | 'authorId'>): Observable<RankItem>;
  getRankItems(partyId: string): Observable<RankItem[]>;
}
