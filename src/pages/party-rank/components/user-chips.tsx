import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import { Avatar, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { AppUser } from '../../../core/interfaces/app-user.interface';

interface UserChipsProps {
  users: AppUser[];
  title: string;
  showAdd?: boolean;
  onDelete?: (user: AppUser) => void;
  onAdd?: () => void;
}

export const UserChips = ({ users: participants, title, onDelete, onAdd, showAdd = false }: UserChipsProps) => {
  const { t } = useTranslation();

  const handleDelete = (user: AppUser) => () => {
    onDelete(user);
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
            <Grid item key={user._id}>
              <Chip
                sx={{
                  mr: 1,
                }}
                size="medium"
                avatar={<Avatar alt={user.displayName} src={user.photoURL} />}
                label={user.displayName}
                variant="filled"
                onDelete={onDelete ? handleDelete(user) : null}
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
