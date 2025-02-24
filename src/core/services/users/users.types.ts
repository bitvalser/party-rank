import { Observable } from 'rxjs';

import { AppUser, UserProfile } from '../../interfaces/app-user.interface';

export interface IUsersSearchPayload {
  filters?: Partial<{ name: string }>;
  limit?: number;
  offset?: number;
  ids?: string[];
}

export interface IUsersService {
  searchUsers(payload: IUsersSearchPayload): Observable<{ count: number; users: AppUser[] }>;
  getUserProfileById(userId: string): Observable<UserProfile>;
}
