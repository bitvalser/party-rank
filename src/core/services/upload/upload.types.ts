import { Observable } from 'rxjs';

import { MediaFile } from '../../interfaces/media-file.interface';

export interface IUploadService {
  uploadFile(file: File): Observable<{ file: string; ok: boolean; message?: string }>;
  getAllFiles(): Observable<MediaFile[]>;
  deleteFile(fileId: string): Observable<void>;
}
