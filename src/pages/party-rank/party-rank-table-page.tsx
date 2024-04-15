import { DateTime } from 'luxon';
import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, concat, merge } from 'rxjs';
import { finalize, map, tap, withLatestFrom } from 'rxjs/operators';

import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Card, CardContent, Chip, Fab, Grid, LinearProgress, Tooltip, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { RankItem } from './components/rank-item';
import { UserScoreAvg } from './components/user-score-avg';
import { useSortedPartyItems } from './hooks/useSortedPartyItems';

export const PartyRankTablePage = () => {
  const { id } = useParams();
  const { getPartyRank, getRankItems, getUserRanks, partyItems$, parties$ } = useInjectable(AppTypes.PartyRanks);
  const partyRank = useSubscription(concat(getPartyRank(id), parties$.pipe(map((parties) => parties[id]))));
  const [listLoading, setListLoading] = useState(true);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const currentUser = useSubscription(user$);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const usersRank = useSubscription(getUserRanks(id), []);
  const navigate = useNavigate();
  const partyItems = useSubscription(
    concat(
      getRankItems(id, { fromCache: true }).pipe(
        finalize(() => setListLoading(false)),
        tap((items) => partyItemsKeysRef.current.next(items.map((item) => item.id))),
      ),
      merge(partyItemsKeysRef.current, partyItems$).pipe(
        withLatestFrom(partyItemsKeysRef.current, partyItems$),
        map(([, keys, items]) => keys.map((key) => items[key])),
      ),
    ),
    [],
  );

  const sortedItems = useSortedPartyItems(partyItems, usersRank);

  if (!partyRank || listLoading) {
    return <LinearProgress />;
  }
  const { name, finishedDate, showTable, creatorId, moderators = [] } = partyRank;
  const isCreator = currentUser?.uid === creatorId || moderators.includes(currentUser?.uid);

  if (!showTable && !isCreator) {
    return <Navigate to={`/party-rank/${id}`} replace />;
  }

  const handleResults = () => {
    navigate(`/party-rank/${id}/results`);
  };

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="div">
              Таблица Лидеров
              {!showTable && (
                <Tooltip title="Таблица лидеров сейчас закрыта и доступна только вам">
                  <LockIcon
                    sx={{
                      ml: 1,
                    }}
                  />
                </Tooltip>
              )}
            </Typography>
          </CardContent>
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" component="div">
                {name}
              </Typography>
              <Grid item>
                <Chip color="success" size="small" label="Завершён" />
              </Grid>
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
              {finishedDate && (
                <Typography>
                  Завершён: {DateTime.fromISO(finishedDate).toLocaleString(DateTime.DATETIME_MED)}
                </Typography>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* <ParticipantsList partyItems={partyItems} /> */}
      <UserScoreAvg id={id} partyItems={partyItems} />
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            Итоговый Топ
          </Typography>
        </CardContent>
      </Card>
      <Grid container direction="column">
        {sortedItems.map((item, i) => (
          <RankItem
            rank={i + 1}
            key={item.id}
            data={item}
            partyStatus={PartyRankStatus.Finished}
            favoriteCount={item.favoriteCount}
            userLikesIds={item.userLikesIds}
            showAuthor={false}
            grade={item.grade}
          />
        ))}
      </Grid>

      <Fab
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        size="medium"
        onClick={handleResults}
        color="secondary"
        variant="extended"
        aria-label="Add New"
      >
        <PlayArrowIcon sx={{ mr: 1 }} />
        Результаты
      </Fab>
    </>
  );
};
