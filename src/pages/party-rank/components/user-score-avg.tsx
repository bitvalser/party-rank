import { Fragment, useState } from 'react';
import { finalize } from 'rxjs/operators';

import { Card, CardContent, Divider, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { UserRankResult } from './user-rank-result';

interface UserScoreAvgProps {
  id: string;
  partyItems: RankItem[];
}

export const UserScoreAvg = ({ id, partyItems }: UserScoreAvgProps) => {
  const { getUserRanks } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(finalize(() => setRankLoading(false))),
    [],
  );

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
            Результаты участников
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
          {usersRank.map((userRank, i) => (
            <Fragment key={userRank.author.uid}>
              {i !== 0 && <Divider sx={{ mt: 1 }} />}
              <UserRankResult user={userRank.author} userRank={userRank} partyItems={partyItems} />
            </Fragment>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
