import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';

interface ParticipantsListProps {
  partyItems: RankItem[];
}

export const ParticipantsList = ({ partyItems }: ParticipantsListProps) => {
  const { t } = useTranslation();

  const participants = useMemo(
    () =>
      (partyItems || [])
        .map((item) => item.author)
        .reduce((acc, val) => [...acc, acc.some((item) => item._id === val._id) ? null : val].filter(Boolean), []),
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
            {t('RANK.PARTICIPANTS')} ({participants.length})
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
            <Grid item key={user._id}>
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
