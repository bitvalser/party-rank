import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { AppBar, Avatar, Box, ButtonBase, Container, Grid, Menu, MenuItem, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';
import { PartyRankPage } from '../party-rank/party-rank-page';
import { PartiesListPage } from './parties-list-page';

export const HomePage = () => {
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement>(null);
  const { signOut, user$ } = useInjectable(AppTypes.AuthService);
  const navigate = useNavigate();
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

  return (
    <Container
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
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
            {/* <Button sx={{ color: '#fff' }}>Тест 1</Button>
            <Button sx={{ color: '#fff' }}>Тест 2</Button>
            <Button sx={{ color: '#fff' }}>Тест 3</Button> */}
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
      <Box component="main" sx={{ display: 'flex', flex: 1, p: 3, position: 'relative', flexDirection: 'column' }}>
        <Routes>
          <Route path="/party-rank/:id" Component={PartyRankPage} />
          <Route path="/" Component={PartiesListPage} />
        </Routes>
      </Box>
    </Container>
  );
};
