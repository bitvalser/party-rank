import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthPage } from './pages/auth/auth-page';
import { HomePage } from './pages/home/home-page';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/auth" Component={AuthPage} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
