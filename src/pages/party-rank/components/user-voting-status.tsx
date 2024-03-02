import { useMemo, useRef, useState } from 'react';
import { Subject, from, merge, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Card, CardContent, Chip, Grid, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';

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
  const { getUserRanks, deleteUserRank } = useInjectable(AppTypes.PartyRanks);
  const [rankLoading, setRankLoading] = useState(true);
  const updateRanksRef = useRef(new Subject<void>());
  const usersRank = useSubscription(
    merge(of(void 0), updateRanksRef.current).pipe(
      switchMap(() => from(getUserRanks(id, { includeUser: true })).pipe(finalize(() => setRankLoading(false)))),
    ),
    [],
  );
  const itemsById: Record<string, RankItem> = useMemo(
    () => partyItems.reduce((acc, val) => ({ ...acc, [val.id]: val }), {}),
    [partyItems],
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
              authorId: string;
              author: UserRank;
              favoriteId: string;
              count: number;
            }
          >
        >(
          (acc, val) => ({
            ...acc,
            [val.uid]: {
              authorId: val.uid,
              author: val.author,
              favoriteId: val.favoriteId,
              count: Object.keys(getUserRanksFromResult(val)).length,
            },
          }),
          allUsers,
        )
      : {};
    return Object.values(byUser);
  }, [partyItems, usersRank]);

  const handleClear = (authorId: string) => () => {
    deleteUserRank(id, authorId).subscribe(() => {
      updateRanksRef.current.next();
    });
  };

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
          {usersStatus.map(({ authorId, author, count, favoriteId }) => (
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
                  <Typography>
                    Оценено {count} / {required}
                  </Typography>
                  {favoriteId && itemsById[favoriteId] && (
                    <Chip
                      sx={{ ml: 2 }}
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
                <Tooltip placement="top" title="Удалить оценки">
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
  );
};
