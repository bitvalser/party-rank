import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { finalize, map } from 'rxjs/operators';

import { Card, CardContent, Divider, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';
import { UserRankResult, UserRankResultProps } from './user-rank-result';

interface UserScoreAvgProps {
  id: string;
  partyItems: RankItem[];
}

export const UserScoreAvg = ({ id, partyItems }: UserScoreAvgProps) => {
  const { getUserRanks } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const { t } = useTranslation();
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(
      finalize(() => setRankLoading(false)),
      map((items) =>
        items
          .map((item) => {
            const values = Object.values(getUserRanksFromResult(item));
            const average = values.reduce((acc, { value }) => acc + value, 0) / values.length || 0;
            return {
              ...item,
              average,
            };
          })
          .sort((itemA, itemB) => itemB.average - itemA.average),
      ),
    ),
    [],
  );

  const mapRankToAverage: UserRankResultProps['getAverage'] = useCallback((item) => item.average, []);

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
            {t('RANK.PARTICIPANTS_RESULT')}
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
              <UserRankResult
                user={userRank.author}
                userRank={userRank}
                partyItems={partyItems}
                getAverage={mapRankToAverage}
              />
            </Fragment>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
