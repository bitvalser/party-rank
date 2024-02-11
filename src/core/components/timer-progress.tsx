import { useEffect, useState } from 'react';

import { LinearProgress, LinearProgressProps } from '@mui/material';

interface TimerProgressProps extends LinearProgressProps {
  timer: number;
  step?: number;
}

export const TimerProgress = ({ timer, step = 500, ...rest }: TimerProgressProps) => {
  const [time, setTime] = useState(step);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + step);
    }, step);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      clearInterval(interval);
    }, timer);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step, timer]);

  const progress = (time / timer) * 100;

  return <LinearProgress {...rest} value={progress} variant="determinate" />;
};
