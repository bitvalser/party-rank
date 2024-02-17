import { Container, Grid, Paper, Typography } from '@mui/material';

interface OopsPageProps {
  message?: string;
}

export const OopsPage = ({ message }: OopsPageProps) => {
  return (
    <Container>
      <Grid
        sx={{
          height: '100%',
          display: 'flex',
          flex: 1,
        }}
        container
        justifyContent="center"
        alignItems="center"
      >
        <Paper
          sx={{
            padding: 4,
          }}
        >
          <Grid container alignItems="center" direction="column" spacing={2}>
            <Grid item>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Что-то пошло не так :(
              </Typography>
            </Grid>
            {message && (
              <Grid item>
                <Typography>{message}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
};
