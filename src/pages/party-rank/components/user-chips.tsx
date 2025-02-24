import { MouseEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import { Avatar, Card, CardContent, Chip, Grid, Menu, MenuItem, Typography } from '@mui/material';

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
  const [userEl, setUserEl] = useState(null);
  const [userMenuId, setUserMenuId] = useState(null);

  const handleDelete = (user: AppUser) => () => {
    onDelete(user);
  };

  const handleOpenMenu: (id: string) => MouseEventHandler<HTMLDivElement> = (id: string) => (event) => {
    setUserEl(event.target);
    setUserMenuId(id);
  };

  const handleCloseMenu = () => {
    setUserEl(null);
    setUserMenuId(null);
  };

  const handleProfile = () => {
    window.open(`/profile/${userMenuId}`, '_blank');
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
          <Menu
            open={Boolean(userEl) && userMenuId}
            anchorEl={userEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleProfile}>
              <Typography textAlign="center"> {t('RANK.VIEW_PROFILE')}</Typography>
            </MenuItem>
          </Menu>
          {participants.map((user) => (
            <Grid item key={user._id}>
              <Chip
                sx={{
                  mr: 1,
                  cursor: 'pointer',
                }}
                size="medium"
                avatar={<Avatar alt={user.displayName} src={user.photoURL} />}
                label={user.displayName}
                variant="filled"
                onClick={handleOpenMenu(user._id)}
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
