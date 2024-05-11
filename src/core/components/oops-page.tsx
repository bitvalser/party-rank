import { useTranslation } from 'react-i18next';

import { Container, Grid, Paper, Typography } from '@mui/material';

interface OopsPageProps {
  message?: string;
  code?: string;
}

const getCodeMessage = (code: string) => {
  switch (code) {
    case 'resource-exhausted':
      return 'Превышен лимит на количество чтений базы данных. Ошибка временная и сайт начнёт работать когда наступит новый квота период. Новый период начнётся в 10:00 утра (по МСК)';
    default:
      return '';
  }
};

export const OopsPage = ({ message, code = null }: OopsPageProps) => {
  const { t } = useTranslation();

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
                {t('COMMON.SOMETHING_WENT_WRONG')}
              </Typography>
            </Grid>
            {message && (
              <Grid item>
                <Typography>{message}</Typography>
              </Grid>
            )}
            {code && (
              <Grid item>
                <Typography align="center">{getCodeMessage(code)}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
};
