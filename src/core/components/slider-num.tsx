import React, { FC, useId } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { Box, FormLabel, Grid, Input, Slider, Typography } from '@mui/material';

export interface SliderNumProps extends Partial<ControllerRenderProps> {
  label: string;
  step: number;
  min: number;
  max: number;
  unit?: string;
}

export const SliderNum: FC<SliderNumProps> = ({ label, max, min, step, unit = '', ...field }) => {
  const labelId = useId();

  return (
    <Box>
      <FormLabel id={`${labelId}-slider`}>{label}</FormLabel>
      <Grid
        sx={{
          position: 'relative',
        }}
        container
        spacing={2}
        alignItems="center"
      >
        <Grid item xs>
          <Slider aria-labelledby={`${labelId}-slider`} max={max} min={min} step={step} {...field} />
        </Grid>
        <Grid item direction="row">
          <Input
            sx={{
              width: 80,
            }}
            size="small"
            inputProps={{
              step,
              min: min,
              max: max,
              type: 'tel',
              'aria-labelledby': `${labelId}-slider`,
            }}
            readOnly
            {...field}
          />
          <Typography
            sx={{
              right: 10,
              position: 'absolute',
            }}
            align="right"
            component="span"
          >
            {unit}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

