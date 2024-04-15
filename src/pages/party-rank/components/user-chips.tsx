import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppTypes } from '../../../core/services/types';
import { concatReduce } from '../../../core/utils/concat-reduce';

interface UserChipsProps {
  users: string[];
  title: string;
  onDelete?: (id: string) => void;
}

export const UserChips = ({ users, title, onDelete }: UserChipsProps) => {
  const { getUser } = useInjectable(AppTypes.AuthService);
  const participants = useSubscription(
    of(users).pipe(switchMap((ids) => concatReduce(...ids.map((id) => getUser(id))))),
    [],
  );

  const handleDelete = (id: string) => () => {
    onDelete(id);
  };

  return (
    <Card
      sx={{
        mt: 2,
      }}
    >
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {title} ({participants.length})
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
                onDelete={onDelete ? handleDelete(user.uid) : null}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
