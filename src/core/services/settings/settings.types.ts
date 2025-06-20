import { CachedSubject } from '../../classes/cached-subject.class';

export interface ISettingsService {
  playDuration$: CachedSubject<number>;
  controllablePlayer$: CachedSubject<boolean>;
  defaultVolume$: CachedSubject<number>;
  votingPlayerAutoplay$: CachedSubject<boolean>;
  useVideoStartTime$: CachedSubject<boolean>;
  autoHideRankSection$: CachedSubject<boolean>;
  showCommentsOnResult$: CachedSubject<boolean>;
  disablePreloadForYouTube$: CachedSubject<boolean>;
}
