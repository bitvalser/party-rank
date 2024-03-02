import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, concat, finalize, map, merge, tap, withLatestFrom } from 'rxjs';
import { useThrottledCallback } from 'use-debounce';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DoneIcon from '@mui/icons-material/Done';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TagIcon from '@mui/icons-material/Tag';
import { Avatar, Box, Chip, Grid, IconButton, LinearProgress, SxProps, Theme, Typography } from '@mui/material';

import { GradeMark } from '../../core/components/grade-mark';
import { RankPartyPlayer, RankPartyPlayerRef } from '../../core/components/rank-party-player';
import { TimerProgress } from '../../core/components/timer-progress';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppUser } from '../../core/interfaces/app-user.interface';
import { PartyRank, PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { RankItem } from '../../core/interfaces/rank-item.interface';
import { UserRank } from '../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../core/services/types';
import { getUserRanksFromResult } from '../../core/utils/get-user-ranks';
import { JumpToList } from './components/jump-to-list';
import { useSortedPartyItems } from './hooks/useSortedPartyItems';

interface PartyRankResultsPageComponentProps {
  partyRank: PartyRank;
  items: (RankItem & {
    favoriteCount: number;
    grade: number;
  })[];
  usersRank: (UserRank & { author?: AppUser })[];
  initialControllable: boolean;
  playDuration: number;
  useVideoStartTime: boolean;
}

const controlButtonSx: SxProps<Theme> = {
  height: 'calc(100vh - 160px)',
  width: '150px',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  fontSize: '26px',
  background: 'rgba(0, 0, 0, 0.1)',
  transition: (theme) =>
    theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
    }),
  top: '56px',
  opacity: 0.1,
  '&:hover': {
    opacity: 1,
  },
};

const PartyRankResultsPageComponent = memo(
  ({
    items,
    partyRank,
    usersRank,
    initialControllable,
    playDuration,
    useVideoStartTime,
  }: PartyRankResultsPageComponentProps) => {
    const currentPlayerRef = useRef<RankPartyPlayerRef[]>(Array.from({ length: 2 }));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [controllable, setControllable] = useState(initialControllable);
    const playTimeoutRef = useRef<NodeJS.Timeout>();
    const [paused, setPaused] = useState(false);
    const navigate = useNavigate();

    const userRankByItemId: Record<
      string,
      { users: { author: AppUser; value: number; favorite: boolean; myRank: boolean }[]; total: number }
    > = useMemo(() => {
      try {
        const result: Record<string, { author: AppUser; value: number; favorite: boolean; myRank: boolean }[]> = {};
        const userRankByItem: Record<
          string,
          { users: { author: AppUser; value: number; favorite: boolean; myRank: boolean }[]; total: number }
        > = {};
        const total: Record<string, number> = {};
        items.forEach((item) => {
          usersRank.forEach((rank) => {
            const ranks = getUserRanksFromResult(rank);
            result[item.id] = [
              ...(result[item.id] || []),
              {
                author: rank.author,
                value: ranks[item.id]?.value || null,
                favorite: rank.favoriteId === item.id,
                myRank: rank.author?.uid === item.authorId,
              },
            ];
            total[item.id] = (total[item.id] ?? 0) + (ranks[item.id]?.value ?? 0);
          });
          userRankByItem[item.id] = {
            users: result[item.id],
            total: total[item.id],
          };
        });
        return userRankByItem;
      } catch (error) {
        console.error(error);
        return {};
      }
    }, [items, usersRank]);

    useEffect(() => {
      if (currentIndex === items.length - 1) {
        setControllable(true);
      }
    }, [currentIndex, items.length]);

    useEffect(() => {
      setTimeout(() => {
        if (currentPlayerRef.current[0]) {
          currentPlayerRef.current[0].play();
        }
        if (currentPlayerRef.current[1]) {
          currentPlayerRef.current[1].pause();
        }
      }, 400);
    }, [currentIndex]);

    useEffect(() => {
      if (controllable) return;
      playTimeoutRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1) {
            clearInterval(playTimeoutRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playDuration);
      return () => {
        clearInterval(playTimeoutRef.current);
      };
    }, [controllable, items.length, playDuration]);

    const handleNext = useThrottledCallback(
      () => {
        if (currentIndex === items.length - 1) {
          navigate(`/party-rank/${partyRank.id}`);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      },
      500,
      { trailing: false },
    );

    const handlePrev = useThrottledCallback(
      () => {
        setCurrentIndex((prev) => {
          if (prev === 0) return 0;
          return prev - 1;
        });
      },
      500,
      { trailing: false },
    );

    const handlePause = () => {
      setPaused(true);
      if (playTimeoutRef.current) {
        clearInterval(playTimeoutRef.current);
      }
    };

    const handlePlay = () => {
      setPaused(false);
      if (controllable) return;
      playTimeoutRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1) {
            clearInterval(playTimeoutRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playDuration);
    };

    const goBack = () => {
      navigate(`/party-rank/${partyRank.id}`);
    };

    const ranks = useMemo(
      () =>
        (userRankByItemId[items[currentIndex].id]?.users || [])
          .filter((item) => Boolean(item.author))
          .sort(({ author: authorA }, { author: authorB }) => authorA.displayName.localeCompare(authorB.displayName)),
      [currentIndex, items, userRankByItemId],
    );

    const sizeFactor = Math.max(Math.min(20 / ranks.length, 2), 1);

    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          flexDirection: 'row',
        }}
      >
        {items.map((item, i) => {
          const rank = items.length - i;
          return (
            <Box
              key={item.id}
              sx={(theme) => ({
                width: '80vw',
                height: '100vh',
                position: 'absolute',
                zIndex: currentIndex === i ? 1 : -1,
                top: 0,
                transition: (theme) =>
                  theme.transitions.create('opacity', {
                    duration: theme.transitions.duration.standard,
                  }),
                opacity: currentIndex === i ? 1 : 0,
                [theme.breakpoints.down('md')]: {
                  width: '100vw',
                  height: '50vh',
                  top: '50vh',
                },
              })}
            >
              <Grid
                sx={{
                  top: 0,
                  left: 0,
                  padding: 1,
                  zIndex: 10,
                  position: 'absolute',
                  width: '100%',
                  maxHeight: '100px',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.6)',
                }}
                container
                direction="row"
                alignItems="center"
                wrap="nowrap"
              >
                <Grid container direction="row" alignItems="center" wrap="nowrap">
                  <IconButton onClick={goBack}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Chip
                    sx={{
                      ml: 1,
                    }}
                    size="medium"
                    avatar={rank === 1 ? <EmojiEventsRoundedIcon /> : <TagIcon />}
                    label={<Typography fontWeight="bold">{rank}</Typography>}
                    variant="filled"
                    color="default"
                  />
                  <Typography
                    sx={(theme) => ({
                      ml: 1,
                      [theme.breakpoints.down('md')]: {
                        fontSize: '14px',
                      },
                    })}
                    component="h4"
                  >
                    {item.name}
                  </Typography>
                </Grid>
                <Grid
                  sx={{
                    mr: 2,
                  }}
                  flexGrow={0}
                  flex={0}
                  container
                  direction="row"
                  alignItems="center"
                  wrap="nowrap"
                >
                  {controllable && (
                    <Grid sx={{ mr: 2 }} item>
                      <JumpToList
                        partyItems={items}
                        renderTitle={({ title, index }) => `#${items.length - index} - ${title}`}
                        onJump={setCurrentIndex}
                      />
                    </Grid>
                  )}
                  {item.favoriteCount > 0 && (
                    <Chip
                      sx={{
                        mr: 2,
                      }}
                      size="medium"
                      avatar={<FavoriteIcon />}
                      label={`${item.favoriteCount}`}
                      variant="filled"
                      color="error"
                    />
                  )}
                  {item.grade && <GradeMark size={40} showDecimal={2} fontSize="14px" value={item.grade} />}
                </Grid>
              </Grid>
              {Boolean(currentIndex === i || currentIndex + 1 === i) && (
                <RankPartyPlayer
                  ref={(ref) => (currentPlayerRef.current[i - currentIndex] = ref as any)}
                  type={item.type}
                  startTime={!controllable || useVideoStartTime ? item.startTime ?? 0 : 0}
                  value={item.value}
                  autoplay={currentIndex === i}
                  showTimeControls={controllable}
                  onManualPause={handlePause}
                  onManualPlay={handlePlay}
                />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: 80,
                  width: 90,
                  height: 50,
                  right: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '16px',
                }}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    top: -10,
                    textShadow: (theme) =>
                      `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
                  }}
                  fontWeight="bold"
                >
                  Total
                </Typography>
                <Typography
                  sx={{
                    textShadow: (theme) =>
                      `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
                  }}
                  fontSize="26px"
                  fontWeight="100"
                >
                  {userRankByItemId[item.id].total}
                </Typography>
              </Box>
              {currentIndex === i && !controllable && !paused && (
                <TimerProgress
                  sx={{
                    bottom: '6px',
                    width: '100%',
                  }}
                  timer={playDuration}
                />
              )}
            </Box>
          );
        })}
        {controllable && (
          <>
            <Box
              sx={(theme) => ({
                ...controlButtonSx,
                cursor: currentIndex !== 0 ? 'pointer' : 'initial',
                pointerEvents: currentIndex !== 0 ? 'auto' : 'none',
                left: 0,
                [theme.breakpoints.down('md')]: {
                  right: 0,
                  top: 'calc(50vh + 100px)',
                  height: 'calc(50vh - 160px)',
                  opacity: 0.5,
                },
              })}
              onClick={handlePrev}
            >
              <ArrowBackIosIcon fontSize="inherit" />
            </Box>
            <Box
              sx={(theme) => ({
                ...controlButtonSx,
                right: '20vw',
                cursor: 'pointer',
                [theme.breakpoints.down('md')]: {
                  right: 0,
                  top: 'calc(50vh + 100px)',
                  height: 'calc(50vh - 160px)',
                  opacity: 0.5,
                },
              })}
              onClick={handleNext}
            >
              {currentIndex !== items.length - 1 ? (
                <ArrowForwardIosIcon fontSize="inherit" />
              ) : (
                <DoneIcon fontSize="inherit" />
              )}
            </Box>
          </>
        )}
        <Box
          sx={(theme) => ({
            width: '20vw',
            height: '100vh',
            display: 'flex',
            right: 0,
            top: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'absolute',
            flexDirection: 'row',
            [theme.breakpoints.down('md')]: {
              width: '100vw',
              height: '50vh',
            },
          })}
        >
          <Grid container flexDirection="row" wrap="wrap" justifyContent="space-around" alignContent="start">
            {ranks.map((userRank) => (
              <Grid
                key={userRank.author.uid}
                sx={{ width: 120 * sizeFactor, height: 120 * sizeFactor, position: 'relative' }}
                item
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                wrap="nowrap"
              >
                <Typography
                  sx={{
                    mb: '-12px',
                    zIndex: 2,
                    color: (theme) => (userRank.myRank ? '#00fff9' : theme.palette.text.primary),
                    textShadow: (theme) =>
                      `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
                  }}
                  fontSize={18 * sizeFactor}
                  fontWeight="bold"
                  whiteSpace="nowrap"
                >
                  {userRank.author.displayName}
                </Typography>
                <Avatar
                  sx={{
                    width: 70 * sizeFactor,
                    height: 70 * sizeFactor,
                    borderRadius: 2,
                    border: (theme) =>
                      `2px solid ${!userRank.favorite ? theme.palette.grey[900] : theme.palette.error.main}`,
                  }}
                  alt={userRank.author.displayName}
                  src={userRank.author.photoURL}
                  variant="square"
                />
                {userRank.favorite && (
                  <FavoriteIcon
                    sx={{
                      top: 28,
                      right: 12,
                      width: `${sizeFactor}em`,
                      height: `${sizeFactor}em`,
                      position: 'absolute',
                    }}
                    color="error"
                  />
                )}
                <Box
                  sx={{
                    mt: '-12px',
                    zIndex: 2,
                    padding: '4px',
                    borderRadius: '50%',
                    backgroundColor: (theme) => theme.palette.grey[900],
                  }}
                >
                  <GradeMark
                    size={32 * sizeFactor}
                    fontSize={14 * sizeFactor}
                    value={userRank.value}
                    showDecimal={1}
                    isAuthorRank={userRank.myRank}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  },
);

export const PartyRankResultsPage = () => {
  const { id } = useParams();
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [listLoading, setListLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(true);
  const { getRankItems, getPartyRank, getUserRanks, partyItems$ } = useInjectable(AppTypes.PartyRanks);
  const { controllablePlayer$, playDuration$, useVideoStartTime$ } = useInjectable(AppTypes.SettingsService);
  const playDuration = useSubscription(playDuration$.pipe(map((time) => time * 1000)), 15);
  const controllablePlayer = useSubscription(controllablePlayer$, false);
  const useVideoStartTime = useSubscription(useVideoStartTime$, true);
  const partyRank = useSubscription(getPartyRank(id));
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(finalize(() => setRankLoading(false))),
    [],
  );
  const partyItems = useSubscription(
    concat(
      getRankItems(id, { fromCache: true }).pipe(
        finalize(() => setListLoading(false)),
        tap((items) => partyItemsKeysRef.current.next(items.map((item) => item.id))),
      ),
      merge(partyItemsKeysRef.current, partyItems$).pipe(
        withLatestFrom(partyItemsKeysRef.current, partyItems$),
        map(([, keys, items]) => keys.map((key) => items[key])),
      ),
    ),
    [],
  );
  const sortedResults = useSortedPartyItems(partyItems, usersRank);
  const reversedItems = useMemo(() => sortedResults.reverse(), [sortedResults]);

  if (listLoading || rankLoading) {
    return <LinearProgress />;
  }

  if (partyItems.length === 0) {
    return <Typography>Не было добавлено ни одного предложения</Typography>;
  }

  if (partyRank.status !== PartyRankStatus.Finished) {
    return <Navigate to={`/party-rank/${id}`} replace />;
  }

  return (
    <PartyRankResultsPageComponent
      items={reversedItems}
      partyRank={partyRank}
      usersRank={usersRank}
      playDuration={playDuration}
      initialControllable={controllablePlayer}
      useVideoStartTime={useVideoStartTime}
    />
  );
};
