import { Observable } from 'rxjs';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { MediaFile } from '../../interfaces/media-file.interface';

export interface CdnFilesPayload {
  files: MediaFile[];
  limit: number;
}

export interface IUploadService {
  uploadFile(file: File): Observable<ApiResponse<string>>;
  getAllFiles(): Observable<CdnFilesPayload>;
  deleteFile(fileId: string): Observable<void>;
}
