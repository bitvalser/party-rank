import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, concat, finalize, map, merge, tap, withLatestFrom } from 'rxjs';

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
import { useSortedPartyItems } from './hooks/useSortedPartyItems';

interface PartyRankResultsPageComponentProps {
  partyRank: PartyRank;
  items: (RankItem & {
    favoriteCount: number;
    grade: number;
  })[];
  usersRank: (UserRank & { author?: AppUser })[];
}

const controlButtonSx: SxProps<Theme> = {
  height: 'calc(100vh - 56px)',
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

const NEXT_DELAY = 15000;

const PartyRankResultsPageComponent = memo(({ items, partyRank, usersRank }: PartyRankResultsPageComponentProps) => {
  const currentPlayerRef = useRef<RankPartyPlayerRef[]>(Array.from({ length: 2 }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const userRankByItemId: Record<string, { author: AppUser; value: number; favorite: boolean }[]> = useMemo(() => {
    try {
      const result: Record<string, { author: AppUser; value: number; favorite: boolean }[]> = {};
      items.forEach((item) => {
        usersRank.forEach((rank) => {
          const { favoriteId, uid, author, ...restRank } = rank;
          result[item.id] = [
            ...(result[item.id] || []),
            { author, value: restRank[item.id]?.value || null, favorite: favoriteId === item.id },
          ];
        });
      });
      return result;
    } catch (error) {
      console.error(error);
      return {};
    }
  }, [items, usersRank]);

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
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === items.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, NEXT_DELAY);
    return () => {
      clearInterval(interval);
    };
  }, [items.length]);

  const handleNext = () => {
    if (currentIndex === items.length - 1) {
      navigate(`/party-rank/${partyRank.id}`);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) return 0;
      return prev - 1;
    });
  };

  const goBack = () => {
    navigate(`/party-rank/${partyRank.id}`);
  };

  const ranks = (userRankByItemId[items[currentIndex].id] || []).filter((item) => Boolean(item.author));

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        position: 'relative',
        flexDirection: 'row',
      }}
    >
      {items.map((item, i) => {
        const rank = items.length - i;
        return (
          <Box
            key={item.id}
            sx={{
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
            }}
          >
            <Grid
              sx={{
                top: 0,
                left: 0,
                padding: 1,
                zIndex: 10,
                position: 'absolute',
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
              }}
              container
              direction="row"
              alignItems="center"
              wrap="nowrap"
            >
              <Grid container direction="row" alignItems="center">
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
                <Typography sx={{ ml: 1 }} component="h4">
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
                {item.grade && <GradeMark size={40} fontSize="20px" value={item.grade} />}
              </Grid>
            </Grid>
            {Boolean(currentIndex === i || currentIndex + 1 === i) && (
              <RankPartyPlayer
                ref={(ref) => (currentPlayerRef.current[i - currentIndex] = ref as any)}
                type={item.type}
                value={item.value}
                autoplay={currentIndex === i}
              />
            )}
            {currentIndex === i && (
              <TimerProgress
                sx={{
                  bottom: '6px',
                  width: '100%',
                }}
                timer={NEXT_DELAY}
              />
            )}
          </Box>
        );
      })}
      <Box
        sx={{
          ...controlButtonSx,
          cursor: currentIndex !== 0 ? 'pointer' : 'initial',
          pointerEvents: currentIndex !== 0 ? 'auto' : 'none',
          left: 0,
        }}
        onClick={handlePrev}
      >
        <ArrowBackIosIcon fontSize="inherit" />
      </Box>
      <Box
        sx={{
          ...controlButtonSx,
          right: '20vw',
          cursor: 'pointer',
        }}
        onClick={handleNext}
      >
        {currentIndex !== items.length - 1 ? (
          <ArrowForwardIosIcon fontSize="inherit" />
        ) : (
          <DoneIcon fontSize="inherit" />
        )}
      </Box>
      <Box
        sx={{
          width: '20vw',
          height: '100vh',
          display: 'flex',
          right: 0,
          top: 0,
          position: 'absolute',
          flexDirection: 'row',
        }}
      >
        <Grid container flexDirection="row" wrap="wrap" justifyContent="space-around">
          {ranks.map((userRank) => (
            <Grid
              key={userRank.author.uid}
              sx={{ width: '120px', height: '120px', position: 'relative' }}
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
                  textShadow: (theme) =>
                    `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
                }}
                fontWeight="bold"
              >
                {userRank.author.displayName}
              </Typography>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
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
                <GradeMark size={32} value={userRank.value} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
});

export const PartyRankResultsPage = () => {
  const { id } = useParams();
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [listLoading, setListLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(true);
  const { getRankItems, getPartyRank, getUserRanks, partyItems$ } = useInjectable(AppTypes.PartyRanks);
  const partyRank = useSubscription(getPartyRank(id));
  const usersRank = useSubscription(
    getUserRanks(id, { includeUser: true }).pipe(finalize(() => setRankLoading(false))),
    [],
  );
  const partyItems = useSubscription(
    concat(
      getRankItems(id).pipe(
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
    return <Navigate to={`/party-rank/${id}`} />;
  }

  return <PartyRankResultsPageComponent items={reversedItems} partyRank={partyRank} usersRank={usersRank} />;
};
