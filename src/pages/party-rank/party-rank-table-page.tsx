import { DateTime } from 'luxon';
import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, concat, merge } from 'rxjs';
import { finalize, map, tap, withLatestFrom } from 'rxjs/operators';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Avatar, Card, CardContent, Chip, Fab, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { RankItem } from './components/rank-item';
import { useSortedPartyItems } from './hooks/useSortedPartyItems';

export const PartyRankTablePage = () => {
  const { id } = useParams();
  const { getPartyRank, getRankItems, getUserRanks, partyItems$, parties$ } = useInjectable(AppTypes.PartyRanks);
  const partyRank = useSubscription(concat(getPartyRank(id), parties$.pipe(map((parties) => parties[id]))));
  const [listLoading, setListLoading] = useState(true);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const usersRank = useSubscription(getUserRanks(id), []);
  const navigate = useNavigate();
  const partyItems = useSubscription(
    concat(
      getRankItems(id).pipe(
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

  const participants = useMemo(
    () =>
      (partyItems || [])
        .map((item) => item.author)
        .reduce((acc, val) => [...acc, acc.some((item) => item.uid === val.uid) ? null : val].filter(Boolean), []),
    [partyItems],
  );
  const sortedItems = useSortedPartyItems(partyItems, usersRank);

  if (!partyRank || listLoading) {
    return <LinearProgress />;
  }

  const handleResults = () => {
    navigate(`/party-rank/${id}/results`);
  };

  const { name, finishedDate } = partyRank;

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="div">
              Таблица Лидеров
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
      <Card
        sx={{
          mt: 2,
        }}
      >
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              Участники ({participants.length})
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="row"
            spacing={1}
            wrap="wrap"
          >
            {participants.map((user) => (
              <Grid item key={user.uid}>
                <Chip
                  sx={{
                    mr: 1,
                  }}
                  size="medium"
                  avatar={<Avatar alt={user.displayName} src={user.photoURL} />}
                  label={user.displayName}
                  variant="filled"
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
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
