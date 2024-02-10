import { User, UserCredential } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

import { AppUser } from '../../interfaces/app-user.interface';

export interface IAuthService {
  user$: BehaviorSubject<User>;
  ready$: BehaviorSubject<boolean>;
  signIn(token: string): Observable<UserCredential>;
  signOut(): Observable<void>;
  getUser(uid: string): Observable<AppUser>;
}
