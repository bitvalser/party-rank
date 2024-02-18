import { CachedSubject } from '../../classes/cached-subject.class';

export interface ISettingsService {
  playDuration$: CachedSubject<number>;
  controllablePlayer$: CachedSubject<boolean>;
  defaultVolume$: CachedSubject<number>;
}
