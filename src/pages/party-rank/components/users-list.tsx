import { Fragment } from 'react';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppTypes } from '../../../core/services/types';

interface UsersListProps {
  userIds: string[];
}

export const UsersList = ({ userIds }: UsersListProps) => {
  const { getUser } = useInjectable(AppTypes.AuthService);
  const participants = useSubscription(
    of(void 0).pipe(switchMap(() => forkJoin(userIds.map((id) => getUser(id))))),
    [],
  );

  return (
    <Grid sx={{ minWidth: '300px' }} container direction="column">
      {participants.length === 0 && <CircularProgress />}
      <List>
        {participants.map((user, i) => (
          <Fragment key={user.uid}>
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
