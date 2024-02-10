import { DateTime } from 'luxon';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BehaviorSubject, concat, merge } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { AddNewItem, AddNewItemProps } from './components/add-new-item';

export const PartyRankPage = () => {
  const { getPartyRank, getRankItems, partyItems$, parties$ } = useInjectable(AppTypes.PartyRanks);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const { id } = useParams();
  const partyRank = useSubscription(concat(getPartyRank(id), parties$.pipe(map((parties) => parties[id]))));
  const currentUser = useSubscription(user$);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const partyItems = useSubscription(
    concat(
      getRankItems(id).pipe(tap((items) => partyItemsKeysRef.current.next(items.map((item) => item.id)))),
      merge(partyItemsKeysRef.current, partyItems$).pipe(
        withLatestFrom(partyItemsKeysRef.current, partyItems$),
        map(([, keys, items]) => keys.map((key) => items[key])),
      ),
    ),
    [],
  );

  console.log('partyItems');
  console.log(partyItems);

  if (!partyRank) {
    return <LinearProgress />;
  }

  const { creator, deadlineDate, finishDate, name, status, finishedDate, createdDate, creatorId } = partyRank;
  const isCreator = currentUser?.uid === creatorId;

  const handleNewRank: AddNewItemProps['onAddNew'] = (item) => {
    partyItemsKeysRef.current.next([item.id, ...partyItemsKeysRef.current.getValue()]);
  };

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        <Card>
          {creator && (
            <CardHeader
              avatar={<Avatar alt={creator.displayName} src={creator.photoURL} />}
              title={creator.displayName}
              subheader={createdDate ? DateTime.fromISO(createdDate).toLocaleString(DateTime.DATETIME_MED) : ''}
            />
          )}
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" component="div">
                {name}
              </Typography>
              <Grid item>
                {status === PartyRankStatus.Ongoing && <Chip color="primary" size="small" label="В процессе" />}
                {status === PartyRankStatus.Rating && <Chip color="secondary" size="small" label="Голосование" />}
                {status === PartyRankStatus.Finished && <Chip color="success" size="small" label="Завершён" />}
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
              <Typography>Дедлайн: {DateTime.fromISO(deadlineDate).toLocaleString(DateTime.DATETIME_MED)}</Typography>
              <Typography>
                Конец голосования: {DateTime.fromISO(finishDate).toLocaleString(DateTime.DATETIME_MED)}
              </Typography>
              {status === PartyRankStatus.Finished && finishedDate && (
                <Typography>
                  Завершён: {DateTime.fromISO(finishedDate).toLocaleString(DateTime.DATETIME_MED)}
                </Typography>
              )}
            </Grid>
          </CardContent>
          {isCreator && (
            <CardActions>
              {status === PartyRankStatus.Ongoing && <Button size="small">Начать голосование</Button>}
              {status === PartyRankStatus.Rating && <Button size="small">Завершить</Button>}
            </CardActions>
          )}
        </Card>
      </Grid>
      <Grid container direction="column" rowSpacing={2}></Grid>
      <AddNewItem partyId={id} onAddNew={handleNewRank} />
    </>
  );
};
