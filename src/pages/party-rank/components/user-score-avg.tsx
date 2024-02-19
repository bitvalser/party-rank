import { useMemo, useState } from 'react';
import { finalize } from 'rxjs/operators';

import { Avatar, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';

import { GradeMark } from '../../../core/components/grade-mark';
import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../../core/services/types';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';

interface UserScoreAvgProps {
  id: string;
  required: number;
}

export const UserScoreAvg = ({ id, required }: UserScoreAvgProps) => {
  const { getUserRanks } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(finalize(() => setRankLoading(false))),
    [],
  );

  const usersStatus = useMemo(() => {
    const byUser = usersRank
      ? usersRank.reduce<
          Record<
            string,
            {
              author: UserRank;
              score: number;
            }
          >
        >((acc, val) => {
          const scores = Object.values(getUserRanksFromResult(val));
          return {
            ...acc,
            [val.uid]: {
              author: val.author,
              score: scores.reduce((acc, item) => acc + item.value),
            },
          };
        }, {})
      : {};
    return Object.values(byUser);
  }, [usersRank]);

  return (
    <Card
      sx={{
        mt: 2,
      }}
    >
      {rankLoading && <LinearProgress />}
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            Прогресс оценивания
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
          {usersStatus.map(({ author, score }) => (
            <Grid container item direction="row" alignItems="center">
              <Grid item xs={2}>
                <Chip
                  size="medium"
                  avatar={<Avatar alt={author.displayName} src={author.photoURL} />}
                  label={author.displayName}
                  variant="filled"
                />
              </Grid>
              <Grid
                sx={{
                  mb: 2,
                }}
                xs
                item
                flexDirection="row"
                justifyContent="flex-end"
              >
                <GradeMark size={32} value={score} />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
