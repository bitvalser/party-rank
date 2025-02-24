import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { catchError, of } from 'rxjs';

import discordIcon from '@assets/icons/discord-colored.png';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import { Avatar, Card, CardContent, Chip, Grid, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts';

import { GRADE_MARK_COLORS, GradeMark } from '../../core/components/grade-mark';
import { OopsPage } from '../../core/components/oops-page';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';

export const DiscordIcon = styled('img')`
  width: 32px;
  height: 32px;
`;
DiscordIcon.defaultProps = { src: discordIcon };

interface ProfilePageComponentProps {
  id: string;
}

const ProfilePageComponent = ({ id }: ProfilePageComponentProps) => {
  const { getUserProfileById } = useInjectable(AppTypes.UsersService);
  const { user$ } = useInjectable(AppTypes.AuthService);
  const [error, setError] = useState(null);
  const user = useSubscription(
    getUserProfileById(id).pipe(
      catchError((error) => {
        setError(error);
        return of(null);
      }),
    ),
  );
  const currentUser = useSubscription(user$);
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const countByRank = user
      ? user.allRanks.reduce<Record<string, number>>(
          (acc, val) => ({ ...acc, [val.toString()]: (acc[val.toString()] ?? 0) + 1 }),
          {},
        )
      : {};
    return Object.entries(countByRank)
      .map(([rank, count]) => ({
        id: rank,
        value: count,
        label: rank,
        color: GRADE_MARK_COLORS[Math.floor(+rank) - 1],
      }))
      .sort((a, b) => +a.id - +b.id);
  }, [user]);
  const allTimeAvg = useMemo(
    () =>
      user && user.allRanks?.length > 0 ? user.allRanks.reduce((acc, val) => acc + val) / user.allRanks.length : 0,
    [user],
  );
  const avgByPartyRankId = useMemo(
    () =>
      user
        ? Object.fromEntries(
            Object.entries(user.ranksByPartyId).map(([key, ranks]) => [
              key,
              ranks.reduce((acc, val) => acc + val) / ranks.length,
            ]),
          )
        : {},
    [user],
  );

  if (error) {
    return <OopsPage message={error?.message} code={error.code} />;
  }

  const { profile, allRanks, parties } = user || {};

  const handleDiscord = () => {
    window.open(`https://discord.com/channels/@me/${profile.discordId}`, '_blank');
  };

  const handleViewPartyRank = (id: string) => () => {
    window.open(`/party-rank/${id}`, '_blank');
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
        }}
      >
        {!user && <LinearProgress />}
        <>
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between"></Grid>
            {Boolean(profile) && (
              <Grid
                sx={{
                  marginTop: 1,
                  padding: 1,
                  paddingBottom: 0,
                }}
                container
                direction="column"
                spacing={1}
              >
                <Grid item>
                  <Grid container direction="row">
                    <Grid item>
                      <Avatar
                        variant="rounded"
                        alt={profile.displayName}
                        src={profile.photoURL}
                        sx={{ width: 120, height: 120 }}
                      />
                    </Grid>
                    <Grid item sx={{ ml: 4 }}>
                      <Grid container direction="column">
                        <Grid item>
                          <Typography variant="h3" component="h2">
                            {profile.displayName}
                          </Typography>
                        </Grid>
                        {Boolean(profile.discordId) && (
                          <Grid item>
                            <IconButton onClick={handleDiscord}>
                              <DiscordIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sx={{ mt: 8 }}>
                  <Grid container direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4" component="div">
                      {t('PROFILE.STATISTICS')}
                    </Typography>
                  </Grid>
                  <Grid item direction="column" alignItems="center">
                    <Typography textAlign="center"> {t('PROFILE.ALL_TIME_GRADES')}</Typography>
                    <PieChart
                      sx={{
                        p: 4,
                      }}
                      series={[
                        {
                          data: chartData,
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          paddingAngle: 1,
                          cornerRadius: 4,
                          innerRadius: 60,
                        },
                      ]}
                      height={350}
                    />
                  </Grid>
                  <Grid container direction="row" alignItems="center">
                    <Typography>{t('PROFILE.GRADES_COUNT_ALL_TIME')}:&nbsp;</Typography>
                    <Typography fontWeight="bold">{allRanks.length}</Typography>
                  </Grid>
                  <Grid container direction="row" alignItems="center">
                    <Typography>{t('PROFILE.AVG_ALL_TIME')}:&nbsp;&nbsp;</Typography>
                    <GradeMark size={32} value={allTimeAvg} />
                  </Grid>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </>
      </Card>
      {Boolean(parties) && (
        <>
          <Card
            sx={{
              mt: 2,
            }}
          >
            <CardContent>
              <Grid container direction="row" justifyContent="space-between">
                <Grid item>
                  <Typography variant="h5" component="div">
                    {t('PROFILE.PARTY_RANKS', { count: parties.length })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {(parties || [])
            .slice()
            .reverse()
            .filter(
              (item) =>
                !item.isPrivate || item.creatorId === currentUser._id || item.memberIds.includes(currentUser._id),
            )
            .map((item) => (
              <Grid key={item._id} item>
                <Grid
                  sx={{
                    pl: 2,
                    pr: 2,
                    pt: 1,
                    pb: 1,
                    mt: 2,
                    backgroundColor: (theme) => theme.palette.grey[900],
                    boxShadow: (theme) => theme.shadows[10],
                  }}
                  container
                  direction="row"
                  alignItems="center"
                  wrap="nowrap"
                >
                  <Grid
                    sx={{
                      overflow: 'hidden',
                    }}
                    xs
                    container
                    direction="row"
                    alignItems="center"
                    wrap="nowrap"
                  >
                    <Typography
                      sx={{
                        pr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      variant="h5"
                      component="div"
                      whiteSpace="nowrap"
                    >
                      {item.name}
                    </Typography>
                    {item.creatorId === id && <Chip color="error" size="small" label={t('PROFILE.PARTY_CREATOR')} />}
                    {item.memberIds.includes(id) && (
                      <Chip sx={{ ml: 1 }} color="secondary" size="small" label={t('PROFILE.PARTY_MEMBER')} />
                    )}
                  </Grid>
                  <Grid container flex={0} direction="row" alignItems="center" justifyContent="flex-end" wrap="nowrap">
                    {Boolean(avgByPartyRankId[item._id]) && (
                      <Grid item sx={{ mr: 1 }}>
                        <GradeMark size={32} value={avgByPartyRankId[item._id]} />
                      </Grid>
                    )}
                    <Tooltip placement="top" title={t('RANK.REDIRECT')}>
                      <IconButton onClick={handleViewPartyRank(item._id)} aria-label="delete">
                        <ShortcutIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            ))}
        </>
      )}
    </>
  );
};

export const ProfilePage = () => {
  const { id } = useParams();

  return <ProfilePageComponent key={id} id={id} />;
};
