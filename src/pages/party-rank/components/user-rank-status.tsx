import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Avatar, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { concatReduce } from '../../../core/utils/concat-reduce';

interface UserRankStatusProps {
  partyItems: RankItem[];
  required: number;
  members?: string[];
}

export const UserRankStatus = ({ partyItems, required, members = [] }: UserRankStatusProps) => {
  const { getUser } = useInjectable(AppTypes.AuthService);
  const { t } = useTranslation();
  const usersById = useSubscription<Record<string, { author: AppUser; count: number }>>(
    of(members).pipe(
      switchMap((ids) => concatReduce(...ids.map((itemId) => getUser(itemId)))),
      map((result) => result.reduce((acc, val) => ({ ...acc, [val.uid]: { author: val, count: 0 } }), {})),
    ),
    {},
  );
  const usersStatus = useMemo(() => {
    const byUser = (partyItems || []).reduce<
      Record<
        string,
        {
          author: AppUser;
          count: number;
        }
      >
    >(
      (acc, val) => ({
        ...acc,
        [val.authorId]: {
          author: val.author,
          count: (acc[val.authorId]?.count ?? 0) + 1,
        },
      }),
      usersById,
    );

    return Object.values(byUser).sort(({ author: authorA }, { author: authorB }) =>
      authorA.displayName.localeCompare(authorB.displayName),
    );
  }, [partyItems, usersById]);

  return (
    <Card
      sx={{
        mt: 2,
      }}
    >
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {t('RANK.PARTICIPANTS_STATUS')}
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
          {usersStatus.map(({ author, count }) => (
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
                <Typography
                  sx={{
                    mb: '4px',
                  }}
                >
                  {t('RANK.ITEMS_ADDED', { current: count, required })}
                </Typography>
                <LinearProgress
                  color={count === required ? 'success' : 'primary'}
                  value={Math.min((count / required) * 100, 100)}
                  variant="determinate"
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
