import { memo, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BehaviorSubject, concat, finalize, map, merge, tap, withLatestFrom } from 'rxjs';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DoneIcon from '@mui/icons-material/Done';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, Grid, IconButton, LinearProgress, Rating, SxProps, Theme, Typography } from '@mui/material';

import { GradeMark } from '../../core/components/grade-mark';
import { RankPartyPlayer, RankPartyPlayerRef } from '../../core/components/rank-party-player';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { PartyRank, PartyRankStatus } from '../../core/interfaces/party-rank.interface';
import { RankItem } from '../../core/interfaces/rank-item.interface';
import { UserRank } from '../../core/interfaces/user-rank.interface';
import { AppTypes } from '../../core/services/types';

interface PartRankRankingPageComponentProps {
  partyRank: PartyRank;
  items: RankItem[];
  userRank: UserRank;
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

const PartRankRankingPageComponent = memo(({ items, partyRank, userRank }: PartRankRankingPageComponentProps) => {
  const currentPlayerRef = useRef<RankPartyPlayerRef[]>(Array.from({ length: 2 }));
  const { updateUserRank } = useInjectable(AppTypes.PartyRanks);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = items.findIndex((item) => !userRank[item.id]);
    if (index < 0) return 0;
    return index === items.length - 1 && Boolean(userRank[items[index].id]) ? 0 : index;
  });
  const [currentRank, setCurrentRank] = useState<UserRank>(userRank);
  const navigate = useNavigate();

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

  const doRank = (rankId: string) => (event: any, rank: number) => {
    if (rank) {
      setCurrentRank((prev) => ({ ...prev, [rankId]: { value: rank } }));
      updateUserRank(partyRank.id, { [rankId]: { value: rank } }).subscribe();
    }
  };

  const doFavorite = (rankId: string) => () => {
    setCurrentRank((prev) => ({ ...prev, favoriteId: rankId }));
    updateUserRank(partyRank.id, { favoriteId: rankId }).subscribe();
  };

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
      {items.map((item, i) => (
        <Box
          key={item.id}
          sx={{
            width: '100vw',
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
              <Typography sx={{ ml: 1 }} component="h4">
                {item.name}
              </Typography>
            </Grid>
            <Grid
              sx={{
                mr: 2,
              }}
              item
            >
              <Typography noWrap>
                ({currentIndex + 1} / {items.length})
              </Typography>
            </Grid>
          </Grid>
          {Boolean(currentIndex === i || currentIndex + 1 === i) && (
            <RankPartyPlayer
              ref={(ref) => (currentPlayerRef.current[i - currentIndex] = ref as any)}
              type={item.type}
              value={item.value}
              autoplay={currentIndex === i}
              showTimeControls
            />
          )}
          <Box
            sx={{
              zIndex: 5,
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '60px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <IconButton
              sx={{
                mr: 2,
                p: 1,
                fontSize: '36px',
                backgroundColor: (theme) => theme.palette.grey[900],
              }}
              onClick={doFavorite(item.id)}
            >
              {currentRank.favoriteId === item.id ? (
                <FavoriteIcon color="error" fontSize="inherit" />
              ) : (
                <FavoriteBorderIcon color="error" fontSize="inherit" />
              )}
            </IconButton>
            <Card>
              <Grid
                sx={{
                  p: 2,
                  pt: 1,
                  pb: 1,
                }}
                container
                direction="column"
              >
                <Typography>Ваша оценка</Typography>
                <Rating
                  value={currentRank[item.id]?.value}
                  onChange={doRank(item.id)}
                  precision={0.5}
                  max={10}
                  size="large"
                />
              </Grid>
            </Card>
            <Box
              sx={{
                backgroundColor: (theme) => theme.palette.grey[900],
                borderRadius: '50%',
                p: 1,
                ml: 2,
              }}
            >
              <GradeMark size={38} fontSize="18px" value={currentRank[item.id]?.value ?? 0} showDecimal={1} />
            </Box>
          </Box>
        </Box>
      ))}
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
          cursor: 'pointer',
          right: 0,
        }}
        onClick={handleNext}
      >
        {currentIndex !== items.length - 1 ? (
          <ArrowForwardIosIcon fontSize="inherit" />
        ) : (
          <DoneIcon fontSize="inherit" />
        )}
      </Box>
    </Box>
  );
});

export const PartyRankRankingPage = () => {
  const { id } = useParams();
  const partyItemsKeysRef = useRef(new BehaviorSubject<string[]>([]));
  const [listLoading, setListLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(true);
  const { getRankItems, getPartyRank, getUserRank, partyItems$ } = useInjectable(AppTypes.PartyRanks);
  const partyRank = useSubscription(getPartyRank(id));
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
  const userRank = useSubscription(getUserRank(id).pipe(finalize(() => setRankLoading(false))), {});

  if (listLoading || rankLoading) {
    return <LinearProgress />;
  }

  if (partyItems.length === 0) {
    return <Typography>Не было добавлено ни одного предложения</Typography>;
  }

  if (partyRank.status !== PartyRankStatus.Rating) {
    return <Navigate to={`/party-rank/${id}`} replace />;
  }

  return <PartRankRankingPageComponent items={partyItems} partyRank={partyRank} userRank={userRank} />;
};
