import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subject, from, merge, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Modal,
  Tooltip,
  Typography,
} from '@mui/material';

import { ConfirmModal } from '../../../core/components/confirm-modal';
import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem as IRankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';
import { RankItem } from './rank-item';

interface UserVotingStatusProps {
  id: string;
  partyItems: IRankItem[];
  required: number;
}

export const UserVotingStatus = ({ id, required, partyItems }: UserVotingStatusProps) => {
  const { getUserRanks, deleteUserRank } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const [userRanksId, setUserRanksId] = useState(null);
  const [deleteUserRanksId, setDeleteUserRanksId] = useState(null);
  const { t } = useTranslation();
  const updateRanksRef = useRef(new Subject<void>());
  const usersRank = useSubscription(
    merge(of(void 0), updateRanksRef.current).pipe(
      switchMap(() => from(getUserRanks(id, { includeUser: true })).pipe(finalize(() => setRankLoading(false)))),
    ),
    [],
  );
  const itemsById: Record<string, IRankItem> = useMemo(
    () => partyItems.reduce((acc, val) => ({ ...acc, [val.id]: val }), {}),
    [partyItems],
  );

  const { users: usersStatus, byUser } = useMemo(() => {
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
              authorId: string;
              author: AppUser;
              favoriteId: string;
              count: number;
              ranks: Record<string, { value: number }>;
            }
          >
        >(
          (acc, val) => ({
            ...acc,
            [val.uid]: {
              authorId: val.uid,
              author: val.author,
              favoriteId: val.favoriteId,
              count: Object.keys(getUserRanksFromResult(val)).filter((itemId) => Boolean(itemsById[itemId])).length,
              ranks: getUserRanksFromResult(val),
            },
          }),
          allUsers,
        )
      : {};
    return { users: Object.values(byUser), byUser };
  }, [itemsById, partyItems, usersRank]);

  const handleClear = (authorId: string) => () => {
    setDeleteUserRanksId(authorId);
  };

  const handleShowGrades = (userId: string) => () => {
    setUserRanksId(userId);
  };

  const handleCloseRanksPreview = () => {
    setUserRanksId(null);
  };

  const handleCloseClearModal = () => {
    setDeleteUserRanksId(null);
  };

  const handleClearConfirm = () => {
    deleteUserRank(id, deleteUserRanksId).subscribe(() => {
      updateRanksRef.current.next();
    });
    setDeleteUserRanksId(null);
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
        }}
      >
        {rankLoading && <LinearProgress />}
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              {t('RANK.VOTING_PROGRESS')}
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
            {usersStatus.map(({ authorId, author, count, favoriteId }) => (
              <Grid key={authorId} container item direction="row" alignItems="center" wrap="nowrap">
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
                    overflow: 'hidden',
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
                    <Typography whiteSpace="nowrap">{t('RANK.RATED', { current: count, required })}</Typography>
                    {favoriteId && itemsById[favoriteId] && (
                      <Chip
                        sx={{ ml: 2, overflow: 'hidden' }}
                        size="small"
                        avatar={<FavoriteIcon />}
                        label={itemsById[favoriteId]?.name}
                        variant="filled"
                        color="error"
                      />
                    )}
                  </Grid>
                  <LinearProgress
                    color={count === required ? 'success' : 'primary'}
                    value={(count / required) * 100}
                    variant="determinate"
                  />
                </Grid>
                <Grid sx={{ ml: 1 }} item alignItems="flex-end" justifyContent="flex-end">
                  <Tooltip placement="top" title={t('RANK.SEE_MARKS')}>
                    <IconButton disabled={count === 0} onClick={handleShowGrades(authorId)} aria-label="clear">
                      <VisibilityIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip placement="top" title={t('RANK.REMOVE_MARKS')}>
                    <IconButton onClick={handleClear(authorId)} aria-label="clear">
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      {deleteUserRanksId && (
        <ConfirmModal
          title={byUser[deleteUserRanksId].author.displayName}
          text={t('RANK.ARE_YOU_REALLY_WANT_TO_REMOVE_MARKS')}
          onClose={handleCloseClearModal}
          onConfirm={handleClearConfirm}
        />
      )}
      {userRanksId && (
        <Modal open onClose={handleCloseRanksPreview}>
          <Box
            sx={(theme) => ({
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: 2,
              outline: 'none',
              minWidth: 596,
              maxWidth: '80vw',
              minHeight: 400,
              maxHeight: '80vh',
              borderRadius: '4px',
              paddingBottom: 0,
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
              backgroundColor: (theme) => theme.palette.background.paper,
              [theme.breakpoints.down('md')]: {
                minWidth: '100vw',
                maxWidth: '100vw',
              },
            })}
          >
            <Grid
              sx={{
                marginBottom: '6px',
              }}
              container
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid xs item>
                <Typography
                  sx={{
                    lineHeight: '22px',
                  }}
                  variant="h6"
                  component="h2"
                >
                  {t('RANK.PARTICIPANT_MARKS', { name: byUser[userRanksId].author.displayName })}
                </Typography>
              </Grid>
              <Grid xs={1} container item direction="row" justifyContent="flex-end">
                <IconButton onClick={handleCloseRanksPreview}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Container
              sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
              }}
              maxWidth="xl"
            >
              {partyItems.map((item) => (
                <RankItem
                  data={item}
                  grade={byUser[userRanksId].ranks[item.id]?.value ?? 0}
                  showAuthor={false}
                  showPreviewIcon={false}
                />
              ))}
            </Container>
          </Box>
        </Modal>
      )}
    </>
  );
};
