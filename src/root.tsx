import { ThemeProvider, createTheme } from '@mui/material';

import { AppRouter } from './app-router';
import { InversifyContext, appContainer } from './inversify.config';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const Root = () => {
  return (
    <InversifyContext.Provider value={appContainer}>
      <ThemeProvider theme={darkTheme}>
        <AppRouter />
      </ThemeProvider>
    </InversifyContext.Provider>
  );
};
