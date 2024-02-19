import { memo } from 'react';

import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Chip, Grid, Typography } from '@mui/material';

import { GradeMark } from '../../../core/components/grade-mark';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';

interface UserRankResultProps {
  user: AppUser;
  userRank: UserRank;
  partyItems: RankItem[];
}

export const UserRankResult = memo(({ partyItems = [], user, userRank = {} }: UserRankResultProps) => {
  const values = Object.values(getUserRanksFromResult(userRank));
  const average = values.reduce((acc, { value }) => acc + value, 0) / values.length;
  const favoriteItem = partyItems.find((item) => item.id === userRank.favoriteId);

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
        <Typography component="h5" fontSize={24}>
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
