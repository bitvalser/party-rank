import { useMemo } from 'react';

import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';

interface ParticipantsListProps {
  partyItems: RankItem[];
}

export const ParticipantsList = ({ partyItems }: ParticipantsListProps) => {
  const participants = useMemo(
    () =>
      (partyItems || [])
        .map((item) => item.author)
        .reduce((acc, val) => [...acc, acc.some((item) => item.uid === val.uid) ? null : val].filter(Boolean), []),
    [partyItems],
  );

  return (
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
  );
};
