import { Fragment } from 'react';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Avatar, CircularProgress, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';

interface UsersListProps {
  userIds: string[];
}

export const UsersList = ({ userIds }: UsersListProps) => {
  const participants = useSubscription<AppUser[]>(of(void 0).pipe(switchMap(() => [])), []); // TODO: add method

  return (
    <Grid sx={{ minWidth: '300px' }} container direction="column">
      {participants.length === 0 && <CircularProgress />}
      <List>
        {participants.map((user, i) => (
          <Fragment key={user._id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar alt={user.displayName} src={user.photoURL} />
              </ListItemAvatar>
              <ListItemText primary={user.displayName} />
            </ListItem>
            {participants.length - 1 !== i && <Divider />}
          </Fragment>
        ))}
      </List>
    </Grid>
  );
};
