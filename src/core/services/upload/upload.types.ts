import { Observable } from 'rxjs';

export interface IUploadService {
  uploadFile(file: File): Observable<{ file: string }>;
}
