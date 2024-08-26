import { Duration } from 'luxon';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';

import { RankPartyPlayer, RankPartyPlayerRef } from '../../../core/components/rank-party-player';
import { UsersAutocomplete } from '../../../core/components/users-autocomplete';
import { RankItemType } from '../../../core/interfaces/rank-item.interface';
import { validURL } from '../../../core/utils/valid-url';

interface RankItemFormProps {
  autoplay?: boolean;
  showAuthor?: boolean;
}

export const RankItemForm = ({ autoplay = true, showAuthor = false }: RankItemFormProps) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const playerRef = useRef<RankPartyPlayerRef>();
  const timeRef = useRef<number>();
  const { t } = useTranslation();

  const type = watch('type');
  const value = watch('value');
  const startTime = watch('startTime');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (Date.now() - timeRef.current < 100) {
      return;
    }

    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const tweakAmount = (event.shiftKey ? 0.001 : 0.01) * (event.key === 'ArrowLeft' ? -1 : 1);
      const value = Math.max(startTime + tweakAmount, 0);

      setValue('startTime', value);
      timeRef.current = Date.now();
    }
  };

  const handleStartTime = async () => {
    const time = await playerRef.current.getCurrentTimestamp();
    if (time) {
      setValue('startTime', time);
    }
  };

  const handlePlayTime = () => {
    playerRef.current.playWithTimestamp(startTime ?? 0);
  };

  return (
    <Grid
      sx={{
        marginBottom: '6px',
      }}
      container
      flexDirection="column"
    >
      <Grid container rowSpacing={2} flexDirection="column">
        {showAuthor && (
          <Grid item>
            <Controller
              name="authorId"
              control={control}
              render={({ field }) => (
                <UsersAutocomplete label={t('ADD_RANK_ITEM.AUTHOR')} multiple={false} {...field} />
              )}
            />
          </Grid>
        )}
        <Grid item>
          <Controller
            name="name"
            control={control}
            rules={{
              minLength: 3,
              required: t('ADD_RANK_ITEM.NAME_REQUIRED'),
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                label={t('ADD_RANK_ITEM.NAME')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message as string}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel id="type-group-label">{t('ADD_RANK_ITEM.TYPE')}</FormLabel>
                <RadioGroup
                  aria-labelledby="type-group-label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                  {...field}
                >
                  <FormControlLabel value={RankItemType.Video} control={<Radio />} label={t('ADD_RANK_ITEM.VIDEO')} />
                  <FormControlLabel value={RankItemType.Audio} control={<Radio />} label={t('ADD_RANK_ITEM.AUDIO')} />
                  <FormControlLabel value={RankItemType.Image} control={<Radio />} label={t('ADD_RANK_ITEM.IMAGE')} />
                  <FormControlLabel
                    value={RankItemType.YouTube}
                    control={<Radio />}
                    label={t('ADD_RANK_ITEM.YOUTUBE')}
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            name="value"
            control={control}
            rules={{
              required: 'ADD_RANK_ITEM.LINK_REQUIRED',
              validate: (value) => (validURL(value) ? null : 'ADD_RANK_ITEM.INVALID_LINK'),
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                label={t('ADD_RANK_ITEM.MEDIA_LINK')}
                error={Boolean(errors.value)}
                helperText={errors.value?.message as string}
                {...field}
              />
            )}
          />
          {[RankItemType.Audio, RankItemType.Video].includes(type) && (
            <FormHelperText>{t('ADD_RANK_ITEM.MEDIA_LINK_TIP')}</FormHelperText>
          )}
        </Grid>
        <Grid
          sx={{
            minHeight: 250,
          }}
          container
          direction="column"
        >
          <FormLabel id="anime-provider-group-label">{t('ADD_RANK_ITEM.PREVIEW')}</FormLabel>
          <RankPartyPlayer ref={playerRef} key={value} type={type} value={value} showTimeControls autoplay={autoplay} />
        </Grid>
        {type !== RankItemType.Image && (
          <Grid item>
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
              <Button type="button" variant="text" onClick={handleStartTime}>
                {t('ADD_RANK_ITEM.SET_PLAYBACK_TIME')}
              </Button>
              <Button
                type="button"
                variant="text"
                color="info"
                onClick={handlePlayTime}
                onMouseEnter={(event) => event.currentTarget.focus()}
                onMouseLeave={(event) => event.currentTarget.blur()}
                onKeyDownCapture={handleKeyDown}
              >
                <Typography color="white">
                  {Duration.fromObject({ seconds: startTime }).toFormat('mm:ss:SSS')}
                </Typography>
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
