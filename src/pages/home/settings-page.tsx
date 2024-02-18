import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Card, CardContent, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';

import { SliderNum } from '../../core/components/slider-num';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';

export const SettingsPage = () => {
  const { controllablePlayer$, playDuration$, defaultVolume$ } = useInjectable(AppTypes.SettingsService);
  const playDuration = useSubscription(playDuration$, 0);
  const controllablePlayer = useSubscription(controllablePlayer$, false);
  const defaultVolume = useSubscription(defaultVolume$, 1);
  const [durationValue, setDurationValue] = useState(null);
  const [volumeValue, setVolumeValue] = useState(null);

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
              Звук
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
                label="Громкость по умолчанию"
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
              Страница Результатов
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
                label="Длительность воиспроизведения медиа"
                max={90}
                min={5}
                step={5}
                unit="сек"
                value={durationValue ?? playDuration}
                onChange={handleDurationChange}
                disabled={controllablePlayer}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={controllablePlayer} onChange={handleChangeControllable} />}
                label="Управляемое воспроизведение"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};
