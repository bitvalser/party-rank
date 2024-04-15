import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { finalize } from 'rxjs/operators';

import { Avatar, Button, Card, Chip, Container, Grid, LinearProgress, Paper, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../core/services/types';
import { DISCORD_OAUTH_URL } from './auth-page';
import * as Styled from './auth-page.styles';

const InvitePageComponent = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { getPartyRank } = useInjectable(AppTypes.PartyRanks);
  const partyRank = useSubscription(getPartyRank(id).pipe(finalize(() => setLoading(false))));
  const creator = partyRank?.creator;

  return (
    <Container>
      <Grid
        sx={{
          height: '100%',
        }}
        container
        justifyContent="center"
        alignItems="center"
      >
        <Paper
          sx={{
            padding: 4,
            position: 'relative',
          }}
        >
          {loading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
              }}
            />
          )}
          <Grid container direction="column" spacing={2}>
            {partyRank && (
              <>
                <Grid item>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontFamily: 'monospace',
                    }}
                  >
                    {creator?.displayName} приглашает вас принять участие в пати ранке!
                  </Typography>
                </Grid>
                <Grid item>
                  <Card
                    sx={{
                      backgroundColor: (theme) => theme.palette.grey[900],
                    }}
                  >
                    <Grid sx={{ p: 2 }} container direction="row" alignItems="center" justifyContent="space-between">
                      {creator && (
                        <Chip
                          sx={{
                            mr: 1,
                          }}
                          size="medium"
                          avatar={<Avatar alt={creator.displayName} src={creator.photoURL} />}
                          label={creator.displayName}
                          variant="filled"
                        />
                      )}
                      <Typography variant="h5" component="div">
                        {partyRank.name}
                      </Typography>
                      <Grid item>
                        {partyRank.status === PartyRankStatus.Ongoing && (
                          <Chip color="primary" size="small" label="В процессе" />
                        )}
                        {partyRank.status === PartyRankStatus.Rating && (
                          <Chip color="secondary" size="small" label="Голосование" />
                        )}
                        {partyRank.status === PartyRankStatus.Finished && (
                          <Chip color="success" size="small" label="Завершён" />
                        )}
                        {partyRank.status === PartyRankStatus.Registration && (
                          <Chip color="error" size="small" label="Регистрация" />
                        )}
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </>
            )}
            <Grid item>
              <Button
                sx={{
                  backgroundColor: '#7289da',
                }}
                variant="contained"
                startIcon={<Styled.DiscordIcon />}
                href={`${DISCORD_OAUTH_URL}&state=${btoa(`/party-rank/${id}`)}`}
                fullWidth
                target="_self"
              >
                Войти через дискорд
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
};

export const InvitePage = () => {
  const { ready$, user$ } = useInjectable(AppTypes.AuthService);
  const { id } = useParams();
  const ready = useSubscription(ready$);
  const user = useSubscription(user$);

  if (!ready) {
    return null;
  }

  if (ready && user) {
    return <Navigate to={`/party-rank/${id}`} />;
  }

  return <InvitePageComponent />;
};
