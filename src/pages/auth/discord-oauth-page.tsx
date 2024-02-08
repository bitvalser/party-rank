import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { LinearProgress } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import { AppTypes } from '../../core/services/types';

export const DiscordOauthPage = () => {
  const { signIn } = useInjectable(AppTypes.AuthService);
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      signIn(token).subscribe();
    }
  }, [location.search, signIn]);

  return <LinearProgress />;
};
