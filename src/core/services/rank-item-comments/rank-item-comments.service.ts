import { AxiosInstance } from 'axios';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { RankItem, RankItemComment } from '../../interfaces/rank-item.interface';
import { IAuthService } from '../auth/auth.types';
import { IRankItemCommentsManager } from './rank-item-comments.types';

export class RankItemCommentsManager implements IRankItemCommentsManager {
  private axios: AxiosInstance;
  private authService: IAuthService;
  public partyItemsComments$: BehaviorSubject<Record<string, { comments: RankItemComment[] }>> = new BehaviorSubject<
    Record<string, { comments: RankItemComment[] }>
  >({});

  public constructor(axios: AxiosInstance, authService: IAuthService, rankItems: RankItem[]) {
    this.axios = axios;
    this.authService = authService;

    this.addRankItemComment = this.addRankItemComment.bind(this);
    this.removeRankItemComment = this.removeRankItemComment.bind(this);

    this.partyItemsComments$.next({
      ...this.partyItemsComments$.getValue(),
      ...rankItems.reduce(
        (acc, val) => ({
          ...acc,
          [val._id]: { comments: val.comments },
        }),
        {},
      ),
    });
  }

  public addRankItemComment(rankItemId: string, comment: string): Observable<void> {
    const userId = this.authService.user$.getValue()._id;
    return of(void 0).pipe(
      withLatestFrom(this.partyItemsComments$),
      switchMap(([, partyItemsComments]) => {
        if (
          Array.isArray(partyItemsComments[rankItemId]?.comments) &&
          partyItemsComments[rankItemId].comments.find((item) => item.authorId === userId)
        ) {
          return Promise.resolve(null);
        }
        return this.axios
          .post<ApiResponse<RankItemComment>>(`/items/${rankItemId}/comments`, {
            body: comment,
          })
          .then(({ data: { data: comment } }) => comment);
      }),
      map((newComment) => {
        if (newComment) {
          this.partyItemsComments$.next({
            ...this.partyItemsComments$.getValue(),
            [rankItemId]: {
              comments: [...(this.partyItemsComments$.getValue()[rankItemId]?.comments || []), newComment],
            },
          });
        }
      }),
    );
  }

  public removeRankItemComment(rankItemId: string, comment: RankItemComment): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => {
        return this.axios.delete(`/items/${rankItemId}/comments/${comment._id}`);
      }),
      map(() => null),
      tap(() => {
        this.partyItemsComments$.next({
          ...this.partyItemsComments$.getValue(),
          [rankItemId]: {
            comments: (this.partyItemsComments$.getValue()[rankItemId]?.comments || []).filter(
              (item) => item._id !== comment._id,
            ),
          },
        });
      }),
    );
  }
}
