import { deleteField } from 'firebase/firestore';
import { DateTime } from 'luxon';
import { RichTextReadOnly } from 'mui-tiptap';
import { MouseEventHandler, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, Subject, concat, merge, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DoneIcon from '@mui/icons-material/Done';
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

import { ConfirmModal } from '../../core/components/confirm-modal';
import { OopsPage } from '../../core/components/oops-page';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem } from '../../core/interfaces/rank-item.interface';
import { UserRank } from '../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../core/services/types';
import { exportCsv } from '../../core/utils/export-csv';
import { getUserRanksFromResult } from '../../core/utils/get-user-ranks';
import { AddNewItem, AddNewItemProps } from './components/add-new-item';
import { EditRankItem } from './components/edit-rank-item';
import { EditRankParty } from './components/edit-rank-party';
import { ParticipantsList } from './components/participants-list';
import { RankItem } from './components/rank-item';
import { SelectUserModel } from './components/select-user-modal';
import { UserChips } from './components/user-chips';
import { UserRankResult } from './components/user-rank-result';
import { UserRankStatus } from './components/user-rank-status';
import { UserVotingStatus } from './components/user-voting-status';
import { EXPORT_COLUMN_DEFINITION } from './constants';

export const PartyRankPage = () => {
  const {
    getPartyRank,
    getRankItems,
    deleteRankItem,
    getUserRank,
    updatePartyRank,
    updateUserRank,
    deletePartyRank,
    registerToPartyRank,
    removeUserRegistration,
    addUserRegistration,
    partyItems$,
    parties$,
  } = useInjectable(AppTypes.PartyRanks);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const partyRank = useSubscription(
    concat(
      getPartyRank(id).pipe(
        catchError((error, caught) => {
          setError(error);
          return of(null);
        }),
      ),
      parties$.pipe(map((parties) => parties[id])),
    ),
  );
  const currentUser = useSubscription(user$);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement>(null);
  const [listLoading, setListLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const updateRanksRef = useRef(new Subject<void>());
  const [sortOder, setSortOder] = useState<string>(null);
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

  const sortedItems = useMemo(() => {
    if (sortOder) {
      return partyItems
        .slice()
        .sort((itemA, itemB) =>
          sortOder === 'asc'
            ? (userRank[itemA.id]?.value ?? 0) - (userRank[itemB.id]?.value ?? 0)
            : (userRank[itemB.id]?.value ?? 0) - (userRank[itemA.id]?.value ?? 0),
        );
    }
    return partyItems;
  }, [partyItems, sortOder, userRank]);

  const partyItemsByUser = useMemo(
    () =>
      partyItems && currentUser
        ? partyItems.reduce((acc, val) => ({ ...acc, [val.authorId]: [...(acc[val.authorId] || []), val] }), {
            [currentUser.uid]: [],
          })
        : {},
    [partyItems, currentUser],
  );

  const userRankCount = useMemo(() => {
    const partyItemsIds = partyItems.map((item) => item.id);
    return Object.keys(getUserRanksFromResult(userRank)).filter((itemId) => partyItemsIds.includes(itemId)).length;
  }, [partyItems, userRank]);

  if (error) {
    return <OopsPage message={error?.message} code={error?.code} />;
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
    members = null,
  } = partyRank;
  const isCreator = currentUser?.uid === creatorId || moderators.includes(currentUser?.uid);
  const isMember = !Array.isArray(members) || members.includes(currentUser?.uid);
  const currentUserItems = partyItemsByUser[currentUser?.uid] || [];
  const showAdd =
    (status === PartyRankStatus.Ongoing || (status === PartyRankStatus.Registration && isCreator)) &&
    (isMember || isCreator);

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

  const handleRegistration = () => {
    registerToPartyRank(id).subscribe();
  };

  const handleStartParty = () => {
    updatePartyRank(id, { status: PartyRankStatus.Ongoing }).subscribe();
  };

  const handleRemoveUserRegistration = (userId: string) => {
    removeUserRegistration(id, userId).subscribe();
  };

  const handleShowAddUser = () => {
    setShowAddUser(true);
  };

  const handleAddUser = (uid: string) => {
    addUserRegistration(id, uid).subscribe();
    setShowAddUser(false);
  };

  const handleCloseAddUser = () => {
    setShowAddUser(false);
  };

  const handleCsvExport = () => {
    exportCsv(
      EXPORT_COLUMN_DEFINITION,
      partyItems.map((item) => {
        const parts = item.name.match(/\(([^)]+)\)/g);
        let data: Record<string, string> = {};
        if ((parts[0] || '').toUpperCase().includes('OP')) {
          data.op = (parts[1] || '').replace('(', '').replace(')', '').replaceAll(';', ',').replaceAll('"', "'");
        }
        if ((parts[0] || '').toUpperCase().includes('INS')) {
          data.ins = (parts[1] || '').replace('(', '').replace(')', '').replaceAll(';', ',').replaceAll('"', "'");
        }
        if ((parts[0] || '').toUpperCase().includes('ED')) {
          data.ed = (parts[1] || '').replace('(', '').replace(')', '').replaceAll(';', ',').replaceAll('"', "'");
        }
        return {
          name: item.name.replace(parts[0], '').replace(parts[1], '').trim().replaceAll(';', ',').replaceAll('"', "'"),
          ...data,
        };
      }),
      `${name}.csv`,
    );
  };

  const handleSortOrder = () => {
    setSortOder((prevOrder) => (prevOrder === null ? 'asc' : prevOrder === 'asc' ? 'desc' : null));
  };

  return (
    <>
      <Grid sx={{ overflow: 'hidden' }} container direction="row" rowSpacing={2}>
        <Grid xs item>
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
                        <MenuItem onClick={handleEdit}>{t('RANK.EDIT')}</MenuItem>
                        <MenuItem onClick={handleConfirmDelete}>{t('RANK.DELETE')}</MenuItem>
                      </Menu>
                    </div>
                  ) : null
                }
                subheader={createdDate ? DateTime.fromISO(createdDate).toLocaleString(DateTime.DATETIME_MED) : ''}
              />
            )}
            <CardContent sx={{ overflowX: 'auto' }}>
              <Grid container direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h4" component="div">
                  {name}
                </Typography>
                <Grid item>
                  {status === PartyRankStatus.Ongoing && (
                    <Chip color="primary" size="small" label={t('RANK.ONGOING')} />
                  )}
                  {status === PartyRankStatus.Rating && (
                    <Chip color="secondary" size="small" label={t('RANK.VOTING')} />
                  )}
                  {status === PartyRankStatus.Finished && (
                    <Chip color="success" size="small" label={t('RANK.FINISHED')} />
                  )}
                  {status === PartyRankStatus.Registration && (
                    <Chip color="error" size="small" label={t('RANK.REGISTRATION')} />
                  )}
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
                <Typography>
                  {t('RANK.DEADLINE_AT', {
                    time: DateTime.fromISO(deadlineDate).toLocaleString(DateTime.DATETIME_MED),
                  })}
                </Typography>
                <Typography>
                  {t('RANK.VOTING_DEADLINE_AT', {
                    time: DateTime.fromISO(finishDate).toLocaleString(DateTime.DATETIME_MED),
                  })}
                </Typography>
                {status === PartyRankStatus.Finished && finishedDate && (
                  <Typography>
                    {t('RANK.FINISHED_AT', {
                      time: DateTime.fromISO(finishedDate).toLocaleString(DateTime.DATETIME_MED),
                    })}
                  </Typography>
                )}
              </Grid>
            </CardContent>

            <CardActions>
              {status === PartyRankStatus.Registration && isCreator && (
                <Button onClick={handleStartParty} size="small">
                  {t('RANK.START_RANK')}
                </Button>
              )}
              {status === PartyRankStatus.Ongoing && isCreator && (
                <Button onClick={handleStartVoting} size="small">
                  {t('RANK.START_VOTING')}
                </Button>
              )}
              {status === PartyRankStatus.Registration && !isMember && (
                <Button onClick={handleRegistration} size="small">
                  {t('RANK.REGISTER')}
                </Button>
              )}
              {status === PartyRankStatus.Rating && isCreator && (
                <Button onClick={handleFinish} size="small">
                  {t('RANK.FINISH_RANK')}
                </Button>
              )}
              {status === PartyRankStatus.Finished && (showTable || isCreator) && (
                <Button onClick={handleTableView} size="small">
                  {t('RANK.LEADERBOARD')}
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
                  {t('RANK.UNLOCK_LEADERBOARD')}
                </Button>
              )}
              <Button onClick={handleCopyInvite} size="small">
                {t('RANK.COPE_INVITE_LINK')}
              </Button>
              {status === PartyRankStatus.Finished && !listLoading && (
                <Button onClick={handleCsvExport} size="small">
                  {t('RANK.EXPORT_TO_CSV')}
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      {isCreator && moderators?.length > 0 && <UserChips users={moderators} title={t('RANK.MODERATORS')} />}
      {isCreator && members?.length > 0 && status !== PartyRankStatus.Finished && (
        <>
          <UserChips
            key={members.join()}
            users={members}
            title={t('RANK.PARTICIPANTS')}
            showAdd={isCreator && [PartyRankStatus.Registration, PartyRankStatus.Ongoing].includes(status)}
            onDelete={isCreator ? handleRemoveUserRegistration : null}
            onAdd={handleShowAddUser}
          />
          {showAddUser && <SelectUserModel onClose={handleCloseAddUser} onSelect={handleAddUser} />}
        </>
      )}
      {status === PartyRankStatus.Finished && !members && <ParticipantsList partyItems={partyItems} />}
      {status === PartyRankStatus.Finished && members?.length > 0 && (
        <UserChips users={members} title={t('RANK.PARTICIPANTS')} />
      )}
      {isCreator && status === PartyRankStatus.Rating && !listLoading && (
        <UserVotingStatus id={id} required={partyItems.length} partyItems={partyItems} />
      )}
      {isCreator && status === PartyRankStatus.Ongoing && !listLoading && (
        <UserRankStatus partyItems={partyItems} required={requiredQuantity} members={members} />
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
                {t('RANK.CONTENDERS_ADDED', { current: currentUserItems.length, required: requiredQuantity })}
              </Typography>
              {currentUserItems.length < requiredQuantity && (
                <Chip color="primary" size="small" label={t('RANK.CONTENDERS_ADDED_IN_PROGRESS')} />
              )}
              {currentUserItems.length >= requiredQuantity && (
                <Chip color="success" size="small" label={t('RANK.CONTENDERS_ADDED_READY')} />
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
      {status === PartyRankStatus.Registration && isMember && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container direction="row" alignItems="center">
              <Typography sx={{ mr: 2 }} variant="h6" component="div">
                {t('RANK.REGISTERED')}
              </Typography>
              <DoneIcon color="success" />
            </Grid>
          </CardContent>
        </Card>
      )}
      {currentUserItems.length === 0 && status === PartyRankStatus.Ongoing && isMember && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                {t('RANK.CONTENDERS_TO_JOIN', { quantity: requiredQuantity })}
              </Typography>
              <Chip color="warning" size="small" label="Ожидание" />
            </Grid>
          </CardContent>
        </Card>
      )}
      {status === PartyRankStatus.Rating && !userRank.favoriteId && isMember && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container alignItems="center" flexDirection="row">
              <NotificationsIcon color="warning" />
              <Typography sx={{ ml: 1 }} variant="h6" component="div">
                {t('RANK.SELECT_FAVORITE')} <FavoriteIcon color="error" sx={{ mb: '-4px' }} fontSize="small" />!
              </Typography>
            </Grid>
          </CardContent>
        </Card>
      )}
      {status === PartyRankStatus.Rating && isMember && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Typography sx={{ mb: 2 }} variant="h6" component="div">
              {t('RANK.YOUR_RESULT')}
            </Typography>
            <UserRankResult partyItems={partyItems} user={currentUser} userRank={userRank} />
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
              <Grid container item direction="row" alignItems="center">
                <Grid
                  sx={{
                    mb: 2,
                  }}
                  xs
                  item
                >
                  <Grid
                    sx={{
                      mb: '6px',
                      overflow: 'hidden',
                    }}
                    container
                    direction="row"
                    alignItems="center"
                    wrap="nowrap"
                  >
                    <Typography>{t('RANK.RATED', { current: userRankCount, required: partyItems.length })}</Typography>
                  </Grid>
                  <LinearProgress
                    color={userRankCount === partyItems.length ? 'success' : 'primary'}
                    value={(userRankCount / partyItems.length) * 100}
                    variant={listLoading ? 'indeterminate' : 'determinate'}
                  />
                </Grid>
              </Grid>
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
          <Grid container direction="row" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5" component="div">
                {t('RANK.CONTENDERS_LIST', { quantity: partyItems.length })}
              </Typography>
            </Grid>
            {Object.values(userRank).length > 0 && (
              <Grid item>
                <Button
                  color="inherit"
                  variant="text"
                  onClick={handleSortOrder}
                  endIcon={
                    sortOder === 'asc' ? <ArrowUpwardIcon /> : sortOder === 'desc' ? <ArrowDownwardIcon /> : null
                  }
                >
                  {t('RANK.SCORE_SORT')}
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Grid container direction="column">
        {sortedItems.map((item) => (
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
        <Tooltip title={t('RANK.RESULTS_TOOLTIP')}>
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
            {t('RANK.RESULTS')}
          </Fab>
        </Tooltip>
      )}
      {status === PartyRankStatus.Rating && (isMember || isCreator) && (
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
          {t('RANK.START_VOTING_FAB')}
        </Fab>
      )}
      {showAdd && (
        <AddNewItem
          disabled={(currentUserItems.length >= requiredQuantity && !isCreator) || listLoading}
          partyId={id}
          isCreator={isCreator}
          items={partyItems}
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
          title={t('RANK.DELETE_RANK_CONFIRMATION')}
          onClose={handleCloseConfirmDelete}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};
