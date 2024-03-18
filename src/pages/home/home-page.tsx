import { useState } from 'react';
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom';

import { AppBar, Avatar, Box, Button, ButtonBase, Container, Grid, Menu, MenuItem, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';
import { PartyRankPage } from '../party-rank/party-rank-page';
import { PartyRankTablePage } from '../party-rank/party-rank-table-page';
import { PartiesListPage } from './parties-list-page';
import { SettingsPage } from './settings-page';
import { UploadPage } from './upload-page';

export const HomePage = () => {
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement>(null);
  const { signOut, user$ } = useInjectable(AppTypes.AuthService);
  const navigate = useNavigate();
  const match = useMatch('/');
  const user = useSubscription(user$);

  const handleLogout = () => {
    setAnchorElUser(null);
    signOut().subscribe();
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleCdn = () => {
    navigate('/upload');
  };

  return (
    <Container
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      maxWidth="xl"
    >
      <AppBar
        sx={{
          padding: 2,
        }}
        position="static"
      >
        <Grid container direction="row" wrap="nowrap" alignItems="center">
          <Grid item>
            <Typography
              variant="h6"
              noWrap
              component="span"
              onClick={handleHome}
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              PARTY RANK
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginLeft: 2,
            }}
            container
            item
            direction="row"
          >
            {!match && (
              <Button sx={{ color: '#fff' }} onClick={handleHome}>
                Список Ранков
              </Button>
            )}
            <Button sx={{ color: '#fff' }} onClick={handleSettings}>
              Настройки
            </Button>
            <Button sx={{ color: '#fff' }} onClick={handleCdn}>
              Загрузить Медиа
            </Button>
          </Grid>
          {user && (
            <Grid item>
              <ButtonBase onClick={handleOpenUserMenu} sx={{ p: 0, borderRadius: 8 }}>
                <Grid container direction="row" alignItems="center" wrap="nowrap">
                  <Avatar alt={user.displayName} src={user.photoURL} />
                  <Typography
                    sx={{
                      marginLeft: 1,
                      paddingRight: 1,
                    }}
                    noWrap
                    fontWeight="600"
                  >
                    {user.displayName}
                  </Typography>
                </Grid>
              </ButtonBase>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Выход</Typography>
                </MenuItem>
              </Menu>
            </Grid>
          )}
        </Grid>
      </AppBar>
      <Box
        component="main"
        sx={(theme) => ({
          display: 'flex',
          flex: 1,
          p: 3,
          pb: 10,
          position: 'relative',
          flexDirection: 'column',
          [theme.breakpoints.down('md')]: {
            p: 0,
          },
        })}
      >
        <Routes>
          <Route path="/party-rank/:id/table" Component={PartyRankTablePage} />
          <Route path="/party-rank/:id" Component={PartyRankPage} />
          <Route path="/settings" Component={SettingsPage} />
          <Route path="/upload" Component={UploadPage} />
          <Route path="/" Component={PartiesListPage} />
          <Route path="/*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Container>
  );
};
