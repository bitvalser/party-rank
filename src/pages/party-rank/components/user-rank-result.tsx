import { memo, useMemo } from 'react';

import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Chip, Grid, Typography } from '@mui/material';

import { GradeMark } from '../../../core/components/grade-mark';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';

export interface UserRankResultProps {
  user: AppUser;
  userRank: UserRank;
  partyItems: RankItem[];
  getAverage?: (rank: UserRank & any) => number;
}

export const UserRankResult = memo(({ partyItems = [], user, userRank, getAverage }: UserRankResultProps) => {
  const average = useMemo(() => {
    if (getAverage) {
      return getAverage(userRank);
    }
    const entries = Object.entries(getUserRanksFromResult(userRank));
    const itemIds = partyItems.map((item) => item._id);
    return (
      entries.filter(([itemId]) => itemIds.includes(itemId)).reduce((acc, [, { value }]) => acc + value, 0) /
        entries.length || 0
    );
  }, [getAverage, partyItems, userRank]);
  const favoriteItem = partyItems.find((item) => item._id === userRank.favoriteId);

  return (
    <Grid
      sx={{ pl: 2, pr: 2, pt: 1, pb: 1 }}
      container
      flexDirection="row"
      alignItems="center"
      spacing={1}
      wrap="nowrap"
    >
      <Grid item>
        <Avatar alt={user.displayName} src={user.photoURL} />
      </Grid>
      <Grid item>
        <Typography variant="h5" component="div">
          {user.displayName}
        </Typography>
      </Grid>
      <Grid xs item sx={{ overflow: 'hidden' }}>
        <Grid container justifyContent="flex-end">
          {favoriteItem && (
            <Chip size="medium" avatar={<FavoriteIcon />} label={favoriteItem.name} variant="filled" color="error" />
          )}
        </Grid>
      </Grid>
      <Grid sx={{ ml: 2 }} item>
        <Grid container flexDirection="row" alignItems="center" wrap="nowrap">
          <Typography sx={{ mr: 1 }}>AVG</Typography>
          <GradeMark size={38} fontSize={14} value={average} showDecimal={2} />
        </Grid>
      </Grid>
    </Grid>
  );
});
