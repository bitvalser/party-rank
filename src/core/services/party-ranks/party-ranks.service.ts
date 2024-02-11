import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { AppUser } from '../../interfaces/app-user.interface';
import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
import { UserRank } from '../../interfaces/user-rank.interface';
import { IAuthService } from '../auth/auth.types';
import { AppTypes } from '../types';
import { IPartyRanks } from './party-ranks.types';

@injectable()
export class PartyRanks implements IPartyRanks {
  private firestore: Firestore;
  private authService: IAuthService;
  public parties$: BehaviorSubject<Record<string, PartyRank>> = new BehaviorSubject<Record<string, PartyRank>>({});
  public partyItems$: BehaviorSubject<Record<string, RankItem>> = new BehaviorSubject<Record<string, RankItem>>({});

  public constructor(
    @inject(AppTypes.FirebaseApp) firebaseApp: FirebaseApp,
    @inject(AppTypes.AuthService) authService: IAuthService,
  ) {
    this.firestore = getFirestore(firebaseApp);
    this.authService = authService;
    this.createPartyRank = this.createPartyRank.bind(this);
    this.getParties = this.getParties.bind(this);
    this.updatePartyRank = this.updatePartyRank.bind(this);
    this.getPartyRank = this.getPartyRank.bind(this);
    this.addRankItem = this.addRankItem.bind(this);
    this.getRankItems = this.getRankItems.bind(this);
    this.deleteRankItem = this.deleteRankItem.bind(this);
    this.getUserRank = this.getUserRank.bind(this);
    this.updateUserRank = this.updateUserRank.bind(this);
    this.getUserRanks = this.getUserRanks.bind(this);
  }

  public createPartyRank(payload: Omit<PartyRank, 'creator' | 'creatorId' | 'id'>): Observable<PartyRank> {
    const newRef = doc(collection(this.firestore, FirestoreCollection.Parties));
    const newItem = {
      id: newRef.id,
      creatorId: this.authService.user$.getValue().uid,
      createdDate: DateTime.now().toISO(),
      ...payload,
    };
    return of(void 0).pipe(
      switchMap(() => setDoc(newRef, newItem)),
      map(() => ({
        ...newItem,
        creator: this.authService.user$.getValue(),
      })),
      tap((item) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [item.id]: item,
        });
      }),
    );
  }

  public updatePartyRank(
    id: string,
    payload: Partial<Omit<PartyRank, 'creator' | 'creatorId' | 'id'>>,
  ): Observable<PartyRank> {
    return of(void 0).pipe(
      switchMap(() => updateDoc(doc(this.firestore, FirestoreCollection.Parties, id), payload)),
      withLatestFrom(this.parties$),
      map(([, parties]) => ({
        ...parties[id],
        ...payload,
      })),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank.id]: partyRank,
        });
      }),
    );
  }

  public getParties(): Observable<PartyRank[]> {
    return of(void 0).pipe(
      switchMap(() => getDocs(collection(this.firestore, FirestoreCollection.Parties))),
      switchMap((snapshot) =>
        forkJoin(
          snapshot.docs
            .map((item) => item.data() as Omit<PartyRank, 'creator'>)
            .map((party) =>
              this.authService.getUser(party.creatorId).pipe(map((creator): PartyRank => ({ ...party, creator }))),
            ),
        ),
      ),
      tap((parties) => {
        this.parties$.next(parties.reduce((acc, val) => ({ ...acc, [val.id]: val }), this.parties$.getValue()));
      }),
    );
  }

  public getPartyRank(id: string): Observable<PartyRank> {
    return of(void 0).pipe(
      switchMap(() => getDoc(doc(this.firestore, FirestoreCollection.Parties, id))),
      switchMap((snapshot) => {
        const data = snapshot.data() as Omit<PartyRank, 'creator'>;
        return this.authService.getUser(data.creatorId).pipe(map((creator): PartyRank => ({ ...data, creator })));
      }),
      tap((item) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [item.id]: item,
        });
      }),
    );
  }

  public addRankItem(partyId: string, payload: Omit<RankItem, 'id' | 'author' | 'authorId'>): Observable<RankItem> {
    const newRef = doc(collection(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Items));
    const newItem = {
      id: newRef.id,
      authorId: this.authService.user$.getValue().uid,
      ...payload,
    };
    return of(void 0).pipe(
      switchMap(() => setDoc(newRef, newItem)),
      map(
        (): RankItem => ({
          ...newItem,
          author: this.authService.user$.getValue(),
        }),
      ),
      tap((item) => {
        this.partyItems$.next({
          ...this.partyItems$.getValue(),
          [item.id]: item,
        });
      }),
    );
  }

  public getRankItems(partyId: string): Observable<RankItem[]> {
    return of(void 0).pipe(
      switchMap(() =>
        getDocs(collection(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Items)),
      ),
      switchMap((snapshot) =>
        forkJoin(
          snapshot.docs
            .map((item) => item.data() as Omit<RankItem, 'author'>)
            .map((party) =>
              this.authService.getUser(party.authorId).pipe(map((author): RankItem => ({ ...party, author }))),
            ),
        ),
      ),
      tap((items) => {
        this.partyItems$.next(items.reduce((acc, val) => ({ ...acc, [val.id]: val }), this.partyItems$.getValue()));
      }),
    );
  }

  public deleteRankItem(partyId: string, id: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() =>
        deleteDoc(doc(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Items, id)),
      ),
    );
  }

  public getUserRank(partyId: string): Observable<UserRank> {
    return of(void 0).pipe(
      withLatestFrom(this.authService.user$),
      switchMap(([, currentUser]) =>
        getDoc(doc(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Ranks, currentUser.uid)),
      ),
      map((snapshot) => snapshot.data() || {}),
    );
  }

  public updateUserRank(partyId: string, payload: Partial<UserRank>): Observable<void> {
    return of(void 0).pipe(
      withLatestFrom(this.authService.user$),
      switchMap(([, currentUser]) =>
        setDoc(
          doc(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Ranks, currentUser.uid),
          payload,
          { merge: true },
        ),
      ),
    );
  }

  public getUserRanks(
    partyId: string,
    options: { includeUser?: boolean } = {},
  ): Observable<(UserRank & { uid: string; author?: AppUser })[]> {
    return of(void 0).pipe(
      switchMap(() =>
        getDocs(collection(this.firestore, FirestoreCollection.Parties, partyId, FirestoreCollection.Ranks)),
      ),
      map((snapshot) =>
        snapshot.docs
          .map((item) => ({
            uid: item.id,
            ...item.data(),
          }))
          .filter(Boolean),
      ),
      switchMap((items) => {
        if (options.includeUser) {
          return forkJoin(
            items.map((item) => this.authService.getUser(item.uid).pipe(map((author) => ({ ...item, author })))),
          );
        }
        return of(items);
      }),
    );
  }
}
