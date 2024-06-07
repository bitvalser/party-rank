import { BehaviorSubject, Observable } from 'rxjs';

import { RankItemComment } from '../../interfaces/rank-item.interface';

export interface IRankItemCommentsManager {
  partyItemsComments$: BehaviorSubject<Record<string, { comments: RankItemComment[] }>>;
  addRankItemComment(partyRankId: string, rankItemId: string, comment: string): Observable<void>;
  removeRankItemComment(partyRankId: string, rankItemId: string, comment: RankItemComment): Observable<void>;
}
