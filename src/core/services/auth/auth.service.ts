import { FirebaseApp } from 'firebase/app';
import { Auth, User, UserCredential, getAuth, signInWithCustomToken } from 'firebase/auth';
import { Firestore, doc, getDoc, getFirestore } from 'firebase/firestore';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { AppUser } from '../../interfaces/app-user.interface';
import { AppTypes } from '../types';
import { IAuthService } from './auth.types';

@injectable()
export class AuthService implements IAuthService {
  private auth: Auth;
  private firestore: Firestore;
  private usersCache: Record<string, { invalidate: number; data: AppUser }> = {};
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public constructor(@inject(AppTypes.FirebaseApp) firebaseApp: FirebaseApp) {
    this.auth = getAuth(firebaseApp);
    this.firestore = getFirestore(firebaseApp);
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

  public getUser(uid: string): Observable<AppUser> {
    if (this.usersCache[uid] && this.usersCache[uid].invalidate < Date.now()) {
      return of(this.usersCache[uid].data);
    }
    return of(void 0).pipe(
      switchMap(() => getDoc(doc(this.firestore, FirestoreCollection.Users, uid))),
      map((snapshot) => snapshot.data() as AppUser),
      tap((user) => {
        this.usersCache[user.uid] = {
          invalidate: Date.now() + 60 * 1000,
          data: user,
        };
      }),
    );
  }
}
