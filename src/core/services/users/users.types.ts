import { Observable } from 'rxjs';

import { AppUser } from '../../interfaces/app-user.interface';

export interface IUsersSearchPayload {
  filters: Partial<{ name: string }>;
  limit?: number;
  offset?: number;
}

export interface IUsersService {
  searchUsers(payload: IUsersSearchPayload): Observable<{ count: number; users: AppUser[] }>;
}