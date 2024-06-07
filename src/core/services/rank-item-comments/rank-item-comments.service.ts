import { FirebaseApp } from 'firebase/app';
import { Firestore, arrayRemove, arrayUnion, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { RankItem, RankItemComment } from '../../interfaces/rank-item.interface';
import { IAuthService } from '../auth/auth.types';
import { IRankItemCommentsManager } from './rank-item-comments.types';

export class RankItemCommentsManager implements IRankItemCommentsManager {
  private firestore: Firestore;
  private authService: IAuthService;
  public partyItemsComments$: BehaviorSubject<Record<string, { comments: RankItemComment[] }>> = new BehaviorSubject<
    Record<string, { comments: RankItemComment[] }>
  >({});

  public constructor(firebaseApp: FirebaseApp, authService: IAuthService, rankItems: RankItem[]) {
    this.firestore = getFirestore(firebaseApp);
    this.authService = authService;

    this.addRankItemComment = this.addRankItemComment.bind(this);
    this.removeRankItemComment = this.removeRankItemComment.bind(this);

    this.partyItemsComments$.next({
      ...this.partyItemsComments$.getValue(),
      ...rankItems.reduce(
        (acc, val) => ({
          ...acc,
          [val.id]: { comments: val.comments },
        }),
        {},
      ),
    });
  }

  public addRankItemComment(partyRankId: string, rankItemId: string, comment: string): Observable<void> {
    const userId = this.authService.user$.getValue().uid;
    return of(void 0).pipe(
      withLatestFrom(this.partyItemsComments$),
      switchMap(([, partyItemsComments]) => {
        if (
          Array.isArray(partyItemsComments[rankItemId]?.comments) &&
          partyItemsComments[rankItemId].comments.find((item) => item.authorId === userId)
        ) {
          return Promise.resolve(null);
        }
        const newComment = {
          body: comment,
          authorId: userId,
          id: crypto.randomUUID(),
        };
        return updateDoc(
          doc(this.firestore, FirestoreCollection.Parties, partyRankId, FirestoreCollection.Items, rankItemId),
          {
            comments: arrayUnion(newComment),
          },
        ).then(() => newComment);
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

  public removeRankItemComment(partyRankId: string, rankItemId: string, comment: RankItemComment): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => {
        return updateDoc(
          doc(this.firestore, FirestoreCollection.Parties, partyRankId, FirestoreCollection.Items, rankItemId),
          {
            comments: arrayRemove(comment),
          },
        );
      }),
      tap(() => {
        this.partyItemsComments$.next({
          ...this.partyItemsComments$.getValue(),
          [rankItemId]: {
            comments: (this.partyItemsComments$.getValue()[rankItemId]?.comments || []).filter(
              (item) => item.id !== comment.id,
            ),
          },
        });
      }),
    );
  }
}
