import { AxiosInstance } from 'axios';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { ApiResponse } from '../../interfaces/api-response.interface';
import { IPartyTag } from '../../interfaces/party-tags.interface';
import { AppTypes } from '../types';
import { ITagsService } from './tags.types';

@injectable()
export class TagsService implements ITagsService {
  public tags$: BehaviorSubject<IPartyTag[]> = new BehaviorSubject<IPartyTag[]>([]);
  @inject(AppTypes.Axios)
  private axios: AxiosInstance;

  public constructor() {
    this.getTags = this.getTags.bind(this);
  }

  public getTags(): Observable<IPartyTag[]> {
    return of(void 0).pipe(
      switchMap(() => this.axios.get<ApiResponse<IPartyTag[]>>('/tags')),
      map(({ data: { data: tags } }) => tags),
      tap((tags) => {
        this.tags$.next(tags);
      }),
    );
  }
}
