import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { LinearProgress } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';

export const DiscordOauthPage = () => {
  const { signIn, user$ } = useInjectable(AppTypes.AuthService);
  const currentUser = useSubscription(user$);
  const location = useLocation();
  const state = new URLSearchParams(location.search).get('state') || '';
  const redirectTo = atob(state);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      signIn(token).subscribe();
    }
  }, [location.search, signIn]);

  if (currentUser) {
    return <Navigate to={redirectTo || '/'} replace />;
  }

  return <LinearProgress />;
};
