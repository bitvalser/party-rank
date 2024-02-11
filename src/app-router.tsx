import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LinearProgress } from '@mui/material';

import { useInjectable } from './core/hooks/useInjectable';
import useSubscription from './core/hooks/useSubscription';
import { AppTypes } from './core/services/types';
import { AuthPage } from './pages/auth/auth-page';
import { DiscordOauthPage } from './pages/auth/discord-oauth-page';
import { InvitePage } from './pages/auth/invite-page';
import { HomePage } from './pages/home/home-page';
import { PartyRankRankingPage } from './pages/party-rank/party-rank-ranking-page';
import { PartyRankResultsPage } from './pages/party-rank/party-rank-results-page';

export const AppRouter = () => {
  const { user$, ready$ } = useInjectable(AppTypes.AuthService);
  const user = useSubscription(user$);
  const ready = useSubscription(ready$);

  return ready ? (
    <BrowserRouter>
      <Routes>
        <Route path="/invite/:id" Component={InvitePage} />
        <Route path="/discord-oauth" Component={DiscordOauthPage} />
        {user && (
          <>
            <Route path="/party-rank/:id/ranking" Component={PartyRankRankingPage} />
            <Route path="/party-rank/:id/results" Component={PartyRankResultsPage} />
            <Route path="/*" Component={HomePage} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {!user && (
          <>
            <Route path="/auth" Component={AuthPage} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  ) : (
    <LinearProgress />
  );
};
