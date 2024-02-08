import { FirebaseApp } from 'firebase/app';
import { Auth, User, UserCredential, getAuth, signInWithCustomToken } from 'firebase/auth';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AppTypes } from '../types';
import { IAuthService } from './auth.types';

@injectable()
export class AuthService implements IAuthService {
  private auth: Auth;
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public constructor(@inject(AppTypes.FirebaseApp) firebaseApp: FirebaseApp) {
    this.auth = getAuth(firebaseApp);
    this.auth.onAuthStateChanged((user) => {
      if (!this.ready$.getValue()) {
        this.ready$.next(true);
      }
      this.user$.next(user);
    });
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  public signIn(token: string): Observable<UserCredential> {
    return of(void 0).pipe(switchMap(() => signInWithCustomToken(this.auth, token)));
  }

  public signOut(): Observable<void> {
    return of(void 0).pipe(switchMap(() => this.auth.signOut()));
  }
}
