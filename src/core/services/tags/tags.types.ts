import { BehaviorSubject, Observable } from 'rxjs';

import { IPartyTag } from '../../interfaces/party-tags.interface';

export interface ITagsService {
  tags$: BehaviorSubject<IPartyTag[]>;
  getTags(): Observable<IPartyTag[]>;
}
