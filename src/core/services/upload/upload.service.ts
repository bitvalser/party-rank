import { inject, injectable } from 'inversify';
import { Observable, of } from 'rxjs';
import { combineLatestWith, switchMap } from 'rxjs/operators';

import { IAuthService } from '../auth/auth.types';
import { AppTypes } from '../types';
import { IUploadService } from './upload.types';

@injectable()
export class UploadService implements IUploadService {
  private authService: IAuthService;
  @inject(AppTypes.ServerBaseUrl)
  private baseUrl: string;

  public constructor(@inject(AppTypes.AuthService) authService: IAuthService) {
    this.authService = authService;

    this.uploadFile = this.uploadFile.bind(this);
  }

  public uploadFile(file: File): Observable<{ file: string }> {
    return of(void 0).pipe(
      combineLatestWith(this.authService.user$.getValue().getIdToken()),
      switchMap(([, token]) => {
        const data = new FormData();
        data.append('file', file);
        return fetch(`${this.baseUrl}/cdn/upload`, {
          method: 'POST',
          headers: {
            authorization: token,
          },
          body: data,
        }).then((res) => res.json());
      }),
    );
  }
}
