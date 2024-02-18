import { inject, injectable } from 'inversify';

import { CachedSubject } from '../../classes/cached-subject.class';
import { ISettingsService } from './settings.types';

@injectable()
export class SettingsService implements ISettingsService {
  public playDuration$: CachedSubject<number> = new CachedSubject(localStorage, 'settings:playDuration', 15);
  public defaultVolume$: CachedSubject<number> = new CachedSubject(localStorage, 'settings:defaultVolume', 0.75);
  public controllablePlayer$: CachedSubject<boolean> = new CachedSubject(
    localStorage,
    'settings:controllablePlayer',
    false,
  );
}
