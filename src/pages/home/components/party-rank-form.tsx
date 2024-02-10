import { DateTime } from 'luxon';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

import { SliderNum } from '../../../core/components/slider-num';
import { PartyRankStatus } from '../../../core/interfaces/party-rank.interface';

export interface PartyRankFormValues {
  name: string;
  requiredQuantity: number;
  deadlineDate: DateTime;
  finishDate: DateTime;
  status: PartyRankStatus;
}

interface PartyRankFormProps {
  minDate: DateTime;
}

export const PartyRankForm = ({ minDate }: PartyRankFormProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<PartyRankFormValues>();

  const status = watch('status');

  return (
    <Grid container rowSpacing={2} flexDirection="column">
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
              label="Название \ Тематика"
              error={Boolean(errors.name)}
              helperText={errors.name?.message as string}
              {...field}
            />
          )}
        />
      </Grid>
      <Grid item>
        <Controller
          name="requiredQuantity"
          control={control}
          render={({ field }) => (
            <SliderNum label="Количество предложений от участника" max={10} min={1} step={1} unit="эл." {...field} />
          )}
        />
      </Grid>
      <Grid item>
        <Grid container spacing={1}>
          <Grid item flex={1}>
            <Controller
              name="deadlineDate"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  sx={{
                    width: '100%',
                  }}
                  label="Дедлайн заявок"
                  ampm={false}
                  minDate={minDate}
                  {...field}
                  disabled={status !== PartyRankStatus.Ongoing}
                />
              )}
            />
          </Grid>
          <Grid item flex={1}>
            <Controller
              name="finishDate"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  sx={{
                    width: '100%',
                  }}
                  label="Конец оценивания"
                  ampm={false}
                  minDate={minDate}
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
