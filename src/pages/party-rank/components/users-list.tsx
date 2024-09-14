import { Fragment } from 'react';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Avatar, CircularProgress, Divider, Grid, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { AppTypes } from '../../../core/services/types';

interface UsersListProps {
  userIds: string[];
}

export const UsersList = ({ userIds }: UsersListProps) => {
  const { searchUsers } = useInjectable(AppTypes.UsersService);
  const participants = useSubscription<AppUser[]>(
    searchUsers({ ids: userIds, limit: userIds.length }).pipe(map((data) => data.users)),
    [],
  );

  return (
    <Grid sx={{ minWidth: '300px' }} container direction="column">
      {participants.length === 0 && (
        <Grid
          sx={{
            padding: 2,
            width: '100%',
          }}
          container
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Grid>
      )}
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
