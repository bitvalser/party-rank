import { BehaviorSubject, Observable } from 'rxjs';

import { AppUser } from '../../interfaces/app-user.interface';

export interface IAuthService {
  user$: BehaviorSubject<AppUser>;
  ready$: BehaviorSubject<boolean>;
  signIn(token: string): Observable<void>;
  signOut(): Observable<void>;
  getAuthToken(): string;
}
