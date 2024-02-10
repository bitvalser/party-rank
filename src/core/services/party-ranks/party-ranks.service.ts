import { FirebaseApp } from 'firebase/app';
import { Firestore, collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
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
    this.getPartyRank = this.getPartyRank.bind(this);
    this.addRankItem = this.addRankItem.bind(this);
    this.getRankItems = this.getRankItems.bind(this);
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
}
