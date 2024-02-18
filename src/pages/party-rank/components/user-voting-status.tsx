import { useMemo, useState } from 'react';
import { finalize } from 'rxjs/operators';

import { Avatar, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../../core/services/types';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';

interface UserVotingStatusProps {
  id: string;
  partyItems: RankItem[];
  required: number;
}

export const UserVotingStatus = ({ id, required, partyItems }: UserVotingStatusProps) => {
  const { getUserRanks } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(finalize(() => setRankLoading(false))),
    [],
  );

  const usersStatus = useMemo(() => {
    const allUsers = (partyItems || [])
      .map((item) => item.author)
      .reduce(
        (acc, val) => ({
          ...acc,
          [val.uid]: {
            author: val,
            count: 0,
          },
        }),
        {},
      );
    const byUser = usersRank
      ? usersRank.reduce<
          Record<
            string,
            {
              author: UserRank;
              count: number;
            }
          >
        >(
          (acc, val) => ({
            ...acc,
            [val.uid]: {
              author: val.author,
              count: Object.keys(getUserRanksFromResult(val)).length,
            },
          }),
          allUsers,
        )
      : {};
    return Object.values(byUser);
  }, [partyItems, usersRank]);

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
          {usersStatus.map(({ author, count }) => (
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
              >
                <Typography
                  sx={{
                    mb: '4px',
                  }}
                >
                  Оценено {count} / {required}
                </Typography>
                <LinearProgress
                  color={count === required ? 'success' : 'primary'}
                  value={(count / required) * 100}
                  variant="determinate"
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
