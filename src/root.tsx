import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';

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
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              overflow: 'hidden',
              margin: 0,
            },
            '#root': {
              height: '100vh',
            },
          }}
        />
        <AppRouter />
      </ThemeProvider>
    </InversifyContext.Provider>
  );
};
