import { Duration } from 'luxon';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

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

  const type = watch('type');
  const value = watch('value');
  const startTime = watch('startTime');

  const time = useRef<number>();

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    if(new Date().getTime() - time.current < 500) {
      return
    }

    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const tweakAmount = (event.shiftKey ? 0.001 : 0.01) * (event.key === 'ArrowLeft' ? -1 :  1);
      const value = Math.max(startTime + tweakAmount, 0)

      setValue('startTime', value);
      time.current = new Date().getTime();
    }
  }

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
              render={({ field }) => <UsersAutocomplete label="Автор" multiple={false} {...field} />}
            />
          </Grid>
        )}
        <Grid item>
          <Controller
            name="name"
            control={control}
            rules={{
              minLength: 3,
              required: 'Название обязательное поле!',
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Название"
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
                <FormLabel id="type-group-label">Тип медиа</FormLabel>
                <RadioGroup
                  aria-labelledby="type-group-label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                  {...field}
                >
                  <FormControlLabel value={RankItemType.Video} control={<Radio />} label="Видео" />
                  <FormControlLabel value={RankItemType.Audio} control={<Radio />} label="Аудио" />
                  <FormControlLabel value={RankItemType.Image} control={<Radio />} label="Изображение" />
                  <FormControlLabel value={RankItemType.YouTube} control={<Radio />} label="YouTube" />
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
              required: 'Ссылка обязательное поле!',
              validate: (value) => (validURL(value) ? null : 'Ссылка должна быть действительной!'),
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Ссылка на медиа файл"
                error={Boolean(errors.value)}
                helperText={errors.value?.message as string}
                {...field}
              />
            )}
          />
          {[RankItemType.Audio, RankItemType.Video].includes(type) && (
            <FormHelperText>
              Ссылка должна ввести напрямую на файл (будет иметь разрешение .mp4, .ogg и тд). Возможно сначала нужно
              будет залить файл на CDN.
            </FormHelperText>
          )}
        </Grid>
        <Grid
          sx={{
            minHeight: 250,
          }}
          container
          direction="column"
        >
          <FormLabel id="anime-provider-group-label">Превью</FormLabel>
          <RankPartyPlayer ref={playerRef} key={value} type={type} value={value} showTimeControls autoplay={autoplay} />
        </Grid>
        <Grid item>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Button type="button" variant="text" onClick={handleStartTime}>
              Зафиксировать время начала
            </Button>
            <Button 
              type="button" 
              variant="text" 
              color="info" 
              onClick={handlePlayTime} 
              onMouseEnter={event => event.currentTarget.focus()}
              onMouseLeave={event => event.currentTarget.blur()}
              onKeyDownCapture={handleKeyDown}
            >
              <Typography color="white">{Duration.fromObject({ seconds: startTime }).toFormat('mm:ss:SSS')}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
