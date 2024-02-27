import { CssBaseline, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import { AppRouter } from './app-router';
import { InversifyContext, appContainer } from './inversify.config';

const breakpoints = createTheme().breakpoints;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          [breakpoints.down('md')]: {
            padding: 0,
          },
        },
      },
    },
  },
  typography: {
    h5: {
      [breakpoints.down('md')]: {
        fontSize: '18px',
      },
    },
  },
});

export const MODAL_CONTAINER_ID = '_modal_container';

export const Root = () => {
  return (
    <InversifyContext.Provider value={appContainer}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              body: {
                overflow: 'auto',
                margin: 0,
              },
              '#root': {
                height: '100vh',
              },
              '::-webkit-scrollbar': {
                width: '4px',
                background: 'grey',
                boxShadow: 'inset 0 0 4px #707070',
              },
              '::-webkit-scrollbar-thumb': {
                background: darkTheme.palette.primary.main,
                borderRadius: '10px',
              },
            }}
          />
          <div id={MODAL_CONTAINER_ID} />
          <AppRouter />
        </ThemeProvider>
      </LocalizationProvider>
    </InversifyContext.Provider>
  );
};
