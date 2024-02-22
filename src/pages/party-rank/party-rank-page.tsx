import { deleteField } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { RichTextReadOnly } from 'mui-tiptap';
import { MouseEventHandler, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, Subject, concat, merge, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import FavoriteIcon from '@mui/icons-material/Favorite';
import LockIcon from '@mui/icons-material/Lock';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';

import { ConfirmModal } from '../../core/components/confirm-moda';
import { OopsPage } from '../../core/components/oops-page';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem } from '../../core/interfaces/rank-item.interface';
import { UserRank } from '../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../core/services/types';
import { AddNewItem, AddNewItemProps } from './components/add-new-item';
import { EditRankItem } from './components/edit-rank-item';
import { EditRankParty } from './components/edit-rank-party';
import { ModeratorsList } from './components/moderators-list';
import { ParticipantsList } from './components/participants-list';
import { RankItem } from './components/rank-item';
import { UserRankResult } from './components/user-rank-result';
import { UserRankStatus } from './components/user-rank-status';
import { UserScoreAvg } from './components/user-score-avg';
import { UserVotingStatus } from './components/user-voting-status';

export const PartyRankPage = () => {
  const {
    getPartyRank,
    getRankItems,
    deleteRankItem,
    getUserRank,
    updatePartyRank,
    updateUserRank,
    deletePartyRank,
    partyItems$,
    parties$,
  } = useInjectable(AppTypes.PartyRanks);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const partyRank = useSubscription(
    concat(
      getPartyRank(id).pipe(
        catchError((error, caught) => {
          setError(error);
          return caught;
        }),
      ),
      parties$.pipe(map((parties) => parties[id])),
    ),
  );
  const currentUser = useSubscription(user$);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement>(null);
  const [listLoading, setListLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const updateRanksRef = useRef(new Subject<void>());
  const [editRank, setEditRank] = useState<IRankItem>(null);
  const userRank = useSubscription<UserRank>(
    merge(
      parties$.pipe(
        filter((parties) => Boolean(parties[id])),
        take(1),
      ),
      updateRanksRef.current,
    ).pipe(
      withLatestFrom(parties$),
      filter(([, parties]) => Boolean(parties[id])),
      switchMap(([, parties]) => {
        if (parties[id].status === PartyRankStatus.Ongoing) return of({});
        return getUserRank(id);
      }),
    ),
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
        map((items) => items.sort((itemA, itemB) => itemA.authorId.localeCompare(itemB.authorId))),
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

  if (error) {
    return <OopsPage message={error?.message} />;
  }

  if (!partyRank) {
    return <LinearProgress />;
  }

  const {
    creator,
    deadlineDate,
    finishDate,
    name,
    status,
    finishedDate,
    createdDate,
    creatorId,
    requiredQuantity,
    showTable,
    content,
    moderators = [],
  } = partyRank;
  const isCreator = currentUser?.uid === creatorId || moderators.includes(currentUser?.uid);
  const currentUserItems = partyItemsByUser[currentUser?.uid] || [];

  const handleNewRank: AddNewItemProps['onAddNew'] = (item) => {
    partyItemsKeysRef.current.next([item.id, ...partyItemsKeysRef.current.getValue()]);
  };

  const handleDeleteRank = (rankId: string) => {
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

  const handleUnlockTable = () => {
    updatePartyRank(id, { showTable: true }).subscribe(() => {
      updateRanksRef.current.next();
    });
  };

  const handleEditRank = (item: IRankItem) => () => {
    setEditRank(item);
  };

  const handleCloseEditRank = () => {
    setEditRank(null);
  };

  const handleOpenMenu: MouseEventHandler<HTMLButtonElement> = (event) => {
    setMenuAnchor(event.target as HTMLButtonElement);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    deletePartyRank(id).subscribe(() => {
      navigate('/', { replace: true });
    });
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete(false);
  };

  const handleEdit = () => {
    setShowEdit(true);
    setMenuAnchor(null);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
  };

  return (
    <>
      <Grid container direction="column" rowSpacing={2}>
        <Card>
          {creator && (
            <CardHeader
              avatar={<Avatar alt={creator.displayName} src={creator.photoURL} />}
              title={creator.displayName}
              action={
                isCreator ? (
                  <div>
                    <IconButton onClick={handleOpenMenu} aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
                      <MenuItem onClick={handleEdit}>Редатировать</MenuItem>
                      <MenuItem onClick={handleConfirmDelete}>Удалить</MenuItem>
                    </Menu>
                  </div>
                ) : null
              }
              subheader={createdDate ? DateTime.fromISO(createdDate).toLocaleString(DateTime.DATETIME_MED) : ''}
            />
          )}
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" component="div">
                {name}
              </Typography>
              <Grid item>
                {status === PartyRankStatus.Ongoing && <Chip color="primary" size="small" label="В процессе" />}
                {status === PartyRankStatus.Rating && <Chip color="secondary" size="small" label="Голосование" />}
                {status === PartyRankStatus.Finished && <Chip color="success" size="small" label="Завершён" />}
              </Grid>
            </Grid>
            {content && (
              <Grid item>
                <RichTextReadOnly content={content} extensions={[StarterKit, Link]} />
              </Grid>
            )}
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
            {status === PartyRankStatus.Finished && (showTable || isCreator) && (
              <Button onClick={handleTableView} size="small">
                Таблица Лидеров
              </Button>
            )}
            {status === PartyRankStatus.Finished && !showTable && isCreator && (
              <Button onClick={handleUnlockTable} size="small">
                <LockIcon
                  fontSize="small"
                  sx={{
                    mr: 1,
                  }}
                />
                Открыть таблицу Лидеров
              </Button>
            )}
            <Button onClick={handleCopyInvite} size="small">
              Скопировать инвайт-ссылку
            </Button>
          </CardActions>
        </Card>
      </Grid>
      {isCreator && moderators?.length > 0 && <ModeratorsList moderators={moderators} />}
      {status === PartyRankStatus.Finished && <ParticipantsList partyItems={partyItems} />}
      {isCreator && status === PartyRankStatus.Rating && (
        <UserVotingStatus id={id} required={partyItems.length} partyItems={partyItems} />
      )}
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
      {status === PartyRankStatus.Rating && !userRank.favoriteId && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container alignItems="center" flexDirection="row">
              <NotificationsIcon color="warning" />
              <Typography sx={{ ml: 1 }} variant="h6" component="div">
                Вы ещё не выбрали любимый вариант, не забудьте проголосовать{' '}
                <FavoriteIcon color="error" sx={{ mb: '-4px' }} fontSize="small" />!
              </Typography>
            </Grid>
          </CardContent>
        </Card>
      )}
      {status === PartyRankStatus.Rating && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Typography sx={{ mb: 2 }} variant="h6" component="div">
              Ваш результат
            </Typography>
            <UserRankResult partyItems={partyItems} user={currentUser} userRank={userRank} />
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
            Лист кандидатов ({partyItems.length})
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
            onDelete={handleDeleteRank}
            onClear={handleClearMark}
            onEdit={handleEditRank(item)}
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
        <AddNewItem
          disabled={(currentUserItems.length >= requiredQuantity && !isCreator) || listLoading}
          partyId={id}
          isCreator={isCreator}
          onAddNew={handleNewRank}
        />
      )}
      {editRank && (
        <EditRankItem
          key={editRank.id}
          partyId={id}
          rankValues={editRank}
          onClose={handleCloseEditRank}
          onEdit={handleCloseEditRank}
        />
      )}
      {showEdit && <EditRankParty rankParty={partyRank} onClose={handleCloseEdit} onEdit={handleCloseEdit} />}
      {confirmDelete && (
        <ConfirmModal
          title="Вы точно хотите удалить пати ранк?"
          onClose={handleCloseConfirmDelete}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};
