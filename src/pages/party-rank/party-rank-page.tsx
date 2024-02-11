import { deleteField } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, Subject, concat, merge, of } from 'rxjs';
import { finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fab,
  Grid,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { AddNewItem, AddNewItemProps } from './components/add-new-item';
import { RankItem } from './components/rank-item';
import { UserRankStatus } from './components/user-rank-status';
import { UserVotingStatus } from './components/user-voting-status';

export const PartyRankPage = () => {
  const {
    getPartyRank,
    getRankItems,
    deleteRankItem,
    getUserRank,
    updatePartyRank,
    updateUserRank,
    partyItems$,
    parties$,
  } = useInjectable(AppTypes.PartyRanks);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const { id } = useParams();
  const navigate = useNavigate();
  const partyRank = useSubscription(concat(getPartyRank(id), parties$.pipe(map((parties) => parties[id]))));
  const currentUser = useSubscription(user$);
  const [listLoading, setListLoading] = useState(true);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const updateRanksRef = useRef(new Subject<void>());
  const userRank = useSubscription(
    merge(of(void 0), updateRanksRef.current).pipe(switchMap(() => getUserRank(id))),
    {},
  );
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

  const partyItemsByUser = useMemo(
    () =>
      partyItems && currentUser
        ? partyItems.reduce((acc, val) => ({ ...acc, [val.authorId]: [...(acc[val.authorId] || []), val] }), {
            [currentUser.uid]: [],
          })
        : {},
    [partyItems, currentUser],
  );

  if (!partyRank) {
    return <LinearProgress />;
  }

  const { creator, deadlineDate, finishDate, name, status, finishedDate, createdDate, creatorId, requiredQuantity } =
    partyRank;
  const isCreator = currentUser?.uid === creatorId;
  const currentUserItems = partyItemsByUser[currentUser?.uid] || [];

  const handleNewRank: AddNewItemProps['onAddNew'] = (item) => {
    partyItemsKeysRef.current.next([item.id, ...partyItemsKeysRef.current.getValue()]);
  };

  const handleDelete = (rankId: string) => {
    partyItemsKeysRef.current.next(partyItemsKeysRef.current.getValue().filter((itemId) => itemId !== rankId));
    deleteRankItem(id, rankId).subscribe();
  };

  const handleResults = () => {
    navigate(`/party-rank/${id}/results`);
  };

  const handleStartRanking = () => {
    navigate(`/party-rank/${id}/ranking`);
  };

  const handleStartVoting = () => {
    updatePartyRank(id, { status: PartyRankStatus.Rating }).subscribe();
  };

  const handleFinish = () => {
    updatePartyRank(id, { status: PartyRankStatus.Finished, finishedDate: DateTime.now().toISO() }).subscribe();
  };

  const handleTableView = () => {
    navigate(`/party-rank/${id}/table`);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${id}`);
  };

  const handleClearMark = (rankId: string) => {
    updateUserRank(id, { [rankId]: deleteField() }).subscribe(() => {
      updateRanksRef.current.next();
    });
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

          <CardActions>
            {status === PartyRankStatus.Ongoing && isCreator && (
              <Button onClick={handleStartVoting} size="small">
                Начать Голосование
              </Button>
            )}
            {status === PartyRankStatus.Rating && isCreator && (
              <Button onClick={handleFinish} size="small">
                Завершить
              </Button>
            )}
            {status === PartyRankStatus.Finished && (
              <Button onClick={handleTableView} size="small">
                Таблица Лидеров
              </Button>
            )}
            <Button onClick={handleCopyInvite} size="small">
              Скопировать инвайт-ссылку
            </Button>
          </CardActions>
        </Card>
      </Grid>
      {isCreator && status === PartyRankStatus.Rating && <UserVotingStatus id={id} required={partyItems.length} />}
      {isCreator && status === PartyRankStatus.Ongoing && (
        <UserRankStatus partyItems={partyItems} required={requiredQuantity} />
      )}
      {currentUserItems.length > 0 && status === PartyRankStatus.Ongoing && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          {listLoading && <LinearProgress />}
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                Загружено предложений ({currentUserItems.length} / {requiredQuantity})
              </Typography>
              {currentUserItems.length < requiredQuantity && <Chip color="primary" size="small" label="В процессе" />}
              {currentUserItems.length >= requiredQuantity && <Chip color="success" size="small" label="Готово" />}
            </Grid>
          </CardContent>
        </Card>
      )}
      {currentUserItems.length === 0 && status === PartyRankStatus.Ongoing && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          {listLoading && <LinearProgress />}
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                Для участия необходимо загрузить {requiredQuantity} предложений
              </Typography>
              <Chip color="warning" size="small" label="Ожидание" />
            </Grid>
          </CardContent>
        </Card>
      )}
      <Card
        sx={{
          mt: 2,
        }}
      >
        {listLoading && <LinearProgress />}
        <CardContent>
          <Typography variant="h5" component="div">
            Лист кандидатов
          </Typography>
        </CardContent>
      </Card>
      <Grid container direction="column">
        {partyItems.map((item) => (
          <RankItem
            key={item.id}
            data={item}
            partyStatus={status}
            isCreator={isCreator}
            onDelete={handleDelete}
            onClear={handleClearMark}
            isFavorite={userRank.favoriteId === item.id}
            grade={userRank[item.id]?.value}
          />
        ))}
      </Grid>
      {status === PartyRankStatus.Finished && (
        <Tooltip title="Вы можете изменить параметры воспроизведения в настройках">
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
        </Tooltip>
      )}
      {status === PartyRankStatus.Rating && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          size="medium"
          onClick={handleStartRanking}
          color="secondary"
          variant="extended"
          aria-label="Add New"
        >
          <PlayArrowIcon sx={{ mr: 1 }} />
          Начать оценивание
        </Fab>
      )}
      {status === PartyRankStatus.Ongoing && (
        <AddNewItem disabled={currentUserItems.length >= requiredQuantity} partyId={id} onAddNew={handleNewRank} />
      )}
    </>
  );
};
