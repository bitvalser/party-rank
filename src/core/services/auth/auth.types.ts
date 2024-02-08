import { User, UserCredential } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IAuthService {
  user$: BehaviorSubject<User>;
  ready$: BehaviorSubject<boolean>;
  signIn(token: string): Observable<UserCredential>;
  signOut(): Observable<void>;
}
