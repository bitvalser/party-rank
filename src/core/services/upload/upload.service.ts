import { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { MediaFile } from '../../interfaces/media-file.interface';
import { AppTypes } from '../types';
import { IUploadService } from './upload.types';

@injectable()
export class UploadService implements IUploadService {
  @inject(AppTypes.Axios)
  private axios: AxiosInstance;

  public constructor() {
    this.uploadFile = this.uploadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.getAllFiles = this.getAllFiles.bind(this);
  }

  public uploadFile(file: File): Observable<ApiResponse<string>> {
    return of(void 0).pipe(
      switchMap(() => {
        const data = new FormData();
        data.append('file', file);
        return this.axios.post<ApiResponse<string>>('/cdn/upload', data);
      }),
      map(({ data }) => data),
    );
  }

  public deleteFile(fileId: string): Observable<void> {
    return of(void 0).pipe(
      switchMap(() => this.axios.delete(`/cdn/delete${fileId}`)),
      map(() => {}),
    );
  }

  public getAllFiles(): Observable<MediaFile[]> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<MediaFile[]>>('/cdn/all')),
      map(({ data: { data: files } }) => files),
    );
  }
}
