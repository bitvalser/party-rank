import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, getFirestore } from 'firebase/firestore';
import { inject, injectable } from 'inversify';
import { Observable, of } from 'rxjs';
import { combineLatestWith, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { MediaFile } from '../../interfaces/media-file.interface';
import { IAuthService } from '../auth/auth.types';
import { AppTypes } from '../types';
import { IUploadService } from './upload.types';

@injectable()
export class UploadService implements IUploadService {
  private authService: IAuthService;
  private firestore: Firestore;
  @inject(AppTypes.ServerBaseUrl)
  private baseUrl: string;

  public constructor(
    @inject(AppTypes.AuthService) authService: IAuthService,
    @inject(AppTypes.FirebaseApp) firebaseApp: FirebaseApp,
  ) {
    this.authService = authService;
    this.firestore = getFirestore(firebaseApp);

    this.uploadFile = this.uploadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getAllFiles = this.getAllFiles.bind(this);
  }

  public uploadFile(file: File): Observable<{ file: string; ok: boolean; message?: string }> {
    return of(void 0).pipe(
      combineLatestWith(this.authService.user$.getValue().getIdToken()),
      switchMap(([, token]) => {
        const data = new FormData();
        data.append('file', file);
        return fetch(`${this.baseUrl}/party-rank/cdn/upload`, {
          method: 'POST',
          headers: {
            authorization: token,
          },
          body: data,
        }).then((res) => res.json());
      }),
    );
  }

  public deleteFile(fileId: string): Observable<void> {
    return of(void 0).pipe(
      combineLatestWith(this.authService.user$.getValue().getIdToken()),
      switchMap(([, token]) =>
        fetch(`${this.baseUrl}/party-rank/cdn/delete/${fileId}`, {
          method: 'DELETE',
          headers: {
            authorization: token,
          },
        }),
      ),
      map(() => {}),
    );
  }

  public getAllFiles(): Observable<MediaFile[]> {
    return of(void 0).pipe(
      withLatestFrom(this.authService.user$),
      switchMap(([, user]) => getDoc(doc(this.firestore, FirestoreCollection.CDN, user.uid))),
      map((snapshot) => Object.values<MediaFile>(snapshot.data() || {})),
    );
  }
}
