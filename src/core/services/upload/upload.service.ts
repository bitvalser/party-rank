import { inject, injectable } from 'inversify';
import { Observable, of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { FirestoreCollection } from '../../constants/firestore-collection.constants';
import { MediaFile } from '../../interfaces/media-file.interface';
import { IAuthService } from '../auth/auth.types';
import { AppTypes } from '../types';
import { IUploadService } from './upload.types';

@injectable()
export class UploadService implements IUploadService {
  @inject(AppTypes.AuthService)
  private authService: IAuthService;
  @inject(AppTypes.ServerBaseUrl)
  private baseUrl: string;

  public constructor() {
    this.uploadFile = this.uploadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getAllFiles = this.getAllFiles.bind(this);
  }

  public uploadFile(file: File): Observable<{ file: string; ok: boolean; message?: string }> {
    return of(void 0).pipe(
      switchMap(() => {
        const data = new FormData();
        data.append('file', file);
        return fetch(`${this.baseUrl}/party-rank/cdn/upload`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${this.authService.getAuthToken()}`,
          },
          body: data,
        }).then((res) => res.json());
      }),
    );
  }

  public deleteFile(fileId: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() =>
        fetch(`${this.baseUrl}/party-rank/cdn/delete/${fileId}`, {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${this.authService.getAuthToken()}`,
          },
        }),
      ),
      map(() => {}),
    );
  }

  public getAllFiles(): Observable<MediaFile[]> {
    return of([]);
    // return of(void 0).pipe(
    //   withLatestFrom(this.authService.user$),
    //   switchMap(([, user]) => getDoc(doc(this.firestore, FirestoreCollection.CDN, user._id))),
    //   map((snapshot) => Object.values<MediaFile>(snapshot.data() || {})),
    // );
  }
}
