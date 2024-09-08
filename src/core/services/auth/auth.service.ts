import { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';

import { CachedSubject } from '../../classes/cached-subject.class';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { AppUser } from '../../interfaces/app-user.interface';
import { AppTypes } from '../types';
import { IAuthService } from './auth.types';

@injectable()
export class AuthService implements IAuthService {
  private token$: CachedSubject<string> = new CachedSubject<string>(localStorage, 'auth:jwtToken', null);
  @inject(AppTypes.Axios)
  private axios: AxiosInstance;
  public user$: BehaviorSubject<AppUser> = new BehaviorSubject<AppUser>(null);
  public ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public constructor() {
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.getAuthToken = this.getAuthToken.bind(this);
  }

  public signIn(token: string): Observable<void> {
    if (!token) {
      this.ready$.next(true);
      return of(void 0);
    }
    this.token$.next(token);
    return of(void 0).pipe(
      finalize(() => this.ready$.next(true)),
      switchMap(() => this.axios.get<ApiResponse<AppUser>>('/users/me')),
      map(({ data }) => {
        const { data: user } = data;
        if (!user) {
          this.token$.next(null);
        }
        this.user$.next(user);
      }),
    );
  }

  public signOut(): Observable<void> {
    return of(void 0).pipe(
      tap(() => {
        this.token$.next(null);
      }),
    );
  }

  public getAuthToken(): string {
    return this.token$.getValue();
  }
}
