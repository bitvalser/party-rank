import { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { AppUser, UserProfile } from '../../interfaces/app-user.interface';
import { AppTypes } from '../types';
import { IUsersSearchPayload, IUsersService } from './users.types';

@injectable()
export class UsersService implements IUsersService {
  @inject(AppTypes.Axios)
  private axios: AxiosInstance;

  public constructor() {
    this.searchUsers = this.searchUsers.bind(this);
    this.getUserProfileById = this.getUserProfileById.bind(this);
  }

  public searchUsers(payload: IUsersSearchPayload): Observable<{ count: number; users: AppUser[] }> {
    return of(void 0).pipe(
      switchMap(() =>
        this.axios.post<ApiResponse<AppUser[]>>('/users/search', { ...payload, filters: payload.filters || {} }),
      ),
      map(({ data: { data: users, metadata } }) => ({
        users,
        count: metadata.count,
      })),
    );
  }

  public getUserProfileById(userId: string): Observable<UserProfile> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<UserProfile>>(`/users/profile/${userId}`)),
      map(({ data: { data } }) => data),
    );
  }
}
