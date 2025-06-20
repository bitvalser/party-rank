import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import {
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import { SliderNum } from '../../core/components/slider-num';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';

const LANGUAGE_OPTIONS = [
  {
    value: 'ru',
    label: 'Русский',
  },
  {
    value: 'en',
    label: 'English',
  },
];

export const SettingsPage = () => {
  const {
    controllablePlayer$,
    playDuration$,
    defaultVolume$,
    votingPlayerAutoplay$,
    useVideoStartTime$,
    autoHideRankSection$,
    showCommentsOnResult$,
    disablePreloadForYouTube$,
  } = useInjectable(AppTypes.SettingsService);
  const playDuration = useSubscription(playDuration$, 0);
  const controllablePlayer = useSubscription(controllablePlayer$, false);
  const votingPlayerAutoplay = useSubscription(votingPlayerAutoplay$, false);
  const autoHideRankSection = useSubscription(autoHideRankSection$, false);
  const showCommentsOnResult = useSubscription(showCommentsOnResult$, true);
  const useVideoStartTime = useSubscription(useVideoStartTime$, true);
  const disablePreloadForYouTube = useSubscription(disablePreloadForYouTube$, false);
  const defaultVolume = useSubscription(defaultVolume$, 1);
  const [durationValue, setDurationValue] = useState(null);
  const [volumeValue, setVolumeValue] = useState(null);
  const { t, i18n } = useTranslation();

  const updateDuration = useDebouncedCallback((value: number) => {
    playDuration$.next(value);
  }, 1000);

  const updateVolume = useDebouncedCallback((value: number) => {
    defaultVolume$.next(value);
  }, 1000);

  const handleDurationChange = (event: any, value: number) => {
    setDurationValue(value);
    updateDuration(value);
  };

  const handleVolumeChange = (event: any, value: number) => {
    setVolumeValue(value);
    updateVolume(value / 100);
  };

  const handleChangeControllable = (event: any, value: boolean) => {
    controllablePlayer$.next(value);
  };

  const handleChangeVotingAutoplay = (event: any, value: boolean) => {
    votingPlayerAutoplay$.next(value);
  };

  const handleChangeAutoHideSection = (event: any, value: boolean) => {
    autoHideRankSection$.next(value);
  };

  const handleChangeShowComments = (event: any, value: boolean) => {
    showCommentsOnResult$.next(value);
  };

  const handleChangeDisablePreloadForYouTube = (event: any, value: boolean) => {
    disablePreloadForYouTube$.next(value);
  };

  const handleChangeUseVideoStartTime = (event: any, value: boolean) => {
    useVideoStartTime$.next(value);
  };

  const handleChangeLanguage = (event: SelectChangeEvent) => {
    localStorage.setItem('settings:language', event.target.value);
    i18n.changeLanguage(event.target.value);
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              {t('SETTINGS.SOUND')}
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="column"
            spacing={1}
          >
            <Grid item>
              <SliderNum
                label={t('SETTINGS.DEFAULT_VOLUME')}
                max={100}
                min={0}
                step={1}
                unit="%"
                value={volumeValue ?? +(defaultVolume * 100).toFixed(0)}
                onChange={handleVolumeChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              {t('SETTINGS.RESULT_PAGE')}
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="column"
            spacing={1}
          >
            <Grid item>
              <SliderNum
                label={t('SETTINGS.MEDIA_DURATION')}
                max={90}
                min={5}
                step={5}
                unit={t('COMMON.SECS_UNIT')}
                value={durationValue ?? playDuration}
                onChange={handleDurationChange}
                disabled={controllablePlayer}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                disabled={!controllablePlayer}
                control={<Checkbox checked={useVideoStartTime} onChange={handleChangeUseVideoStartTime} />}
                label={t('SETTINGS.USE_SAVED_TIME')}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={controllablePlayer} onChange={handleChangeControllable} />}
                label={t('SETTINGS.CONTROLLED_PLAY')}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={showCommentsOnResult} onChange={handleChangeShowComments} />}
                label={t('SETTINGS.SHOW_COMMENTS_ON_RESULT')}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox checked={disablePreloadForYouTube} onChange={handleChangeDisablePreloadForYouTube} />
                }
                label={t('SETTINGS.DISABLE_PRELOAD_FOR_YT')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              {t('SETTINGS.RANKING_PAGE')}
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="column"
            spacing={1}
          >
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={votingPlayerAutoplay} onChange={handleChangeVotingAutoplay} />}
                label={t('SETTINGS.RANKING_AUTOPLAY')}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={autoHideRankSection} onChange={handleChangeAutoHideSection} />}
                label={t('SETTINGS.RANKING_AUTO_HIDE_RANK_SECTION')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              {t('SETTINGS.APP')}
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="column"
            spacing={1}
          >
            <Grid item>
              <FormControl>
                <FormLabel>{t('SETTINGS.LANGUAGE')}</FormLabel>
                <Select
                  sx={{
                    width: 300,
                  }}
                  value={i18n.language}
                  onChange={handleChangeLanguage}
                >
                  {LANGUAGE_OPTIONS.map(({ label, value }) => (
                    <MenuItem value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};
