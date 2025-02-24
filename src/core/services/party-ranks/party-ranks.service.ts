import { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { AppUser } from '../../interfaces/app-user.interface';
import { PartyRank } from '../../interfaces/party-rank.interface';
import { RankItem } from '../../interfaces/rank-item.interface';
import { UserRank } from '../../interfaces/user-rank.interface';
import { IAuthService } from '../auth/auth.types';
import { AppTypes } from '../types';
import { IItemsFilters, IPartyRanks } from './party-ranks.types';

const ANISONG_LINKS_HOSTNAME = 'eudist.animemusicquiz.com/';

@injectable()
export class PartyRanks implements IPartyRanks {
  @inject(AppTypes.AuthService)
  private authService: IAuthService;
  @inject(AppTypes.Axios)
  private axios: AxiosInstance;
  public parties$: BehaviorSubject<Record<string, PartyRank>> = new BehaviorSubject<Record<string, PartyRank>>({});
  public partyItems$: BehaviorSubject<Record<string, RankItem>> = new BehaviorSubject<Record<string, RankItem>>({});

  public constructor() {
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
    this.updateRankItem = this.updateRankItem.bind(this);
    this.deletePartyRank = this.deletePartyRank.bind(this);
    this.deleteUserRank = this.deleteUserRank.bind(this);
    this.registerToPartyRank = this.registerToPartyRank.bind(this);
    this.removeUserRegistration = this.removeUserRegistration.bind(this);
    this.unregisterFromPartyRank = this.unregisterFromPartyRank.bind(this);
    this.addUserRegistration = this.addUserRegistration.bind(this);
    this.searchItems = this.searchItems.bind(this);
  }

  public createPartyRank(
    payload: Omit<
      PartyRank,
      'creator' | 'status' | 'memberIds' | 'finishedDate' | 'creatorId' | '_id' | 'createdDate' | 'members'
    >,
  ): Observable<PartyRank> {
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<PartyRank>>('/parties', payload)),
      map(({ data: { data: partyRank } }) => partyRank),
      tap((item) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [item._id]: item,
        });
      }),
    );
  }

  public updatePartyRank(
    id: string,
    payload: Partial<
      Omit<PartyRank, 'creator' | 'memberIds' | 'finishedDate' | 'creatorId' | '_id' | 'createdDate' | 'members'>
    >,
  ): Observable<PartyRank> {
    return of(void 0).pipe(
      switchMap(() => this.axios.patch<ApiResponse<PartyRank>>(`/parties/${id}`, payload)),
      withLatestFrom(this.parties$),
      map(([, parties]) => ({
        ...parties[id],
        ...payload,
      })),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank._id]: partyRank,
        });
      }),
    );
  }

  public registerToPartyRank(id: string): Observable<PartyRank> {
    const userId = this.authService.user$.getValue()._id;
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<PartyRank>>(`/parties/${id}/register`)),
      withLatestFrom(this.parties$),
      map(([, parties]) => ({
        ...parties[id],
        memberIds: [...parties[id]?.memberIds, userId],
      })),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank._id]: partyRank,
        });
      }),
    );
  }

  public unregisterFromPartyRank(id: string): Observable<PartyRank> {
    const userId = this.authService.user$.getValue()._id;
    const newMemberIds = (this.parties$.getValue()[id]?.memberIds || []).filter((itemId) => itemId !== userId);
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<PartyRank>>(`/parties/${id}/unregister`)),
      withLatestFrom(this.parties$),
      map(([, parties]) => ({
        ...parties[id],
        memberIds: newMemberIds,
      })),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank._id]: partyRank,
        });
      }),
    );
  }

  public removeUserRegistration(id: string, userId: string): Observable<PartyRank> {
    const newMemberIds = (this.parties$.getValue()[id]?.memberIds || []).filter((itemId) => itemId !== userId);
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<PartyRank>>(`/parties/${id}/kick`, { userId })),
      withLatestFrom(this.parties$),
      map(([, parties]) => ({
        ...parties[id],
        memberIds: newMemberIds,
        members: parties[id].members.filter((member) => member._id !== userId),
      })),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank._id]: partyRank,
        });
      }),
    );
  }

  public addUserRegistration(id: string, userId: string): Observable<PartyRank> {
    const newMemberIds = [...new Set([...(this.parties$.getValue()[id]?.memberIds || []), userId])];
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<AppUser>>(`/parties/${id}/add-user`, { userId })),
      withLatestFrom(this.parties$),
      map(
        ([
          {
            data: { data: user },
          },
          parties,
        ]) => ({
          ...parties[id],
          memberIds: newMemberIds,
          members: [...parties[id].members, user],
        }),
      ),
      tap((partyRank) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [partyRank._id]: partyRank,
        });
      }),
    );
  }

  public deletePartyRank(id: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => this.axios.delete(`/parties/${id}`)),
      map(() => null),
    );
  }

  public getParties(filters = {}): Observable<PartyRank[]> {
    return of(void 0).pipe(
      switchMap(() =>
        this.axios.post<ApiResponse<PartyRank[]>>('/parties/search?include[]=creator', { limit: 9999, filters }),
      ),
      map(({ data: { data: parties } }) => parties),
      tap((parties) => {
        this.parties$.next(parties.reduce((acc, val) => ({ ...acc, [val._id]: val }), this.parties$.getValue()));
      }),
    );
  }

  public getPartyRank(id: string): Observable<PartyRank> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<PartyRank>>(`/parties/${id}`)),
      map(({ data: { data: partyRank } }) => partyRank),
      tap((item) => {
        this.parties$.next({
          ...this.parties$.getValue(),
          [item._id]: item,
        });
      }),
    );
  }

  public addRankItem(partyId: string, payload: Omit<RankItem, 'id' | 'author'>): Observable<RankItem> {
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<RankItem>>(`/parties/${partyId}/items`, payload)),
      map(({ data: { data: partyItem } }) => partyItem),
      tap((item) => {
        this.partyItems$.next({
          ...this.partyItems$.getValue(),
          [item._id]: item,
        });
      }),
    );
  }

  public getRankItems(partyId: string): Observable<RankItem[]> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<RankItem[]>>(`/parties/${partyId}/items`)),
      map(({ data: { data: items } }) => items),
      // catbox.video links fix
      map((items) =>
        items.map((item) => {
          let value = item.value;
          if (value.includes('catbox.video')) {
            const newLinkUrl = new URL(value);
            newLinkUrl.hostname = ANISONG_LINKS_HOSTNAME;
            value = newLinkUrl.href;
          }
          return {
            ...item,
            value,
          };
        }),
      ),
      tap((items) => {
        this.partyItems$.next(items.reduce((acc, val) => ({ ...acc, [val._id]: val }), this.partyItems$.getValue()));
      }),
    );
  }

  public deleteRankItem(id: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => this.axios.delete(`/items/${id}`)),
      map(() => null),
    );
  }

  public updateRankItem(
    itemId: string,
    payload: Partial<Omit<RankItem, 'id' | 'authorId' | 'author'>>,
  ): Observable<RankItem> {
    return of(void 0).pipe(
      switchMap(() => this.axios.patch(`/items/${itemId}`, payload)),
      withLatestFrom(this.partyItems$),
      map(([, partyItems]): RankItem => ({ ...partyItems[itemId], ...payload })),
      tap((item) => {
        this.partyItems$.next({ ...this.partyItems$.getValue(), [item._id]: item });
      }),
    );
  }

  public getUserRank(partyId: string): Observable<UserRank> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<UserRank>>(`/parties/${partyId}/my-rank`)),
      map(({ data: { data: userRank } }) => userRank || ({ ranks: {} } as UserRank)),
    );
  }

  public updateUserRank(partyId: string, payload: Partial<UserRank>): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => this.axios.post<ApiResponse<UserRank>>(`/parties/${partyId}/rank`, payload)),
      map(() => null),
    );
  }

  public deleteUserRank(partyId: string, uid: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => this.axios.delete(`/parties/${partyId}/rank/${uid}`)),
      map(() => null),
    );
  }

  public getUserRanks(partyId: string, options: { includeUser?: boolean } = {}): Observable<UserRank[]> {
    const includeUsers = '?include[]=author';
    return of(void 0).pipe(
      switchMap(() =>
        this.axios.get<ApiResponse<UserRank[]>>(`/parties/${partyId}/ranks${options.includeUser ? includeUsers : ''}`),
      ),
      map(({ data: { data: userRanks } }) => userRanks),
    );
  }

  // TODO: move in another service
  public searchItems(payload: {
    limit: number;
    offset: number;
    filters: IItemsFilters;
  }): Observable<{ count?: number; items: RankItem[] }> {
    const includeUsers = '?include[]=author';
    return of(void 0).pipe(
      switchMap(() =>
        this.axios.post<ApiResponse<RankItem[]>>('/items/search', {
          ...payload,
          includeCount: payload.offset === 0,
        }),
      ),
      map(({ data: { data: items, metadata } }) => ({ count: metadata.count, items })),
    );
  }
}
