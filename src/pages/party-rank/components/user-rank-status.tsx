import { useMemo } from 'react';

import { Avatar, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';

import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';

interface UserRankStatusProps {
  partyItems: RankItem[];
  required: number;
}

export const UserRankStatus = ({ partyItems, required }: UserRankStatusProps) => {
  const usersStatus = useMemo(() => {
    const byUser = partyItems
      ? partyItems.reduce<
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
          {},
        )
      : {};
    return Object.values(byUser).sort(({ author: authorA }, { author: authorB }) =>
      authorA.displayName.localeCompare(authorB.displayName),
    );
  }, [partyItems]);

  return (
    <Card
      sx={{
        mt: 2,
      }}
    >
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            Статус участников
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
                  Загружено {count} / {required}
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
