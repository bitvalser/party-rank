import { useTranslation } from 'react-i18next';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { AppTypes } from '../../../core/services/types';
import { concatReduce } from '../../../core/utils/concat-reduce';

interface UserChipsProps {
  users: string[];
  title: string;
  showAdd?: boolean;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export const UserChips = ({ users, title, onDelete, onAdd, showAdd = false }: UserChipsProps) => {
  const { getUser } = useInjectable(AppTypes.AuthService);
  const { t } = useTranslation();
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
          {showAdd && (
            <Grid item key="add_item">
              <Chip
                sx={{
                  mr: 1,
                }}
                avatar={<AddIcon />}
                size="medium"
                label={t('RANK.ADD_USER')}
                variant="outlined"
                onClick={onAdd}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
