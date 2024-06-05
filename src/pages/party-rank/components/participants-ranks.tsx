import { ComponentProps, FC, memo, useEffect, useMemo, useState } from 'react';
import { SortEndHandler, SortableContainer, SortableElement } from 'react-sortable-hoc';

import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Box, Grid, Typography } from '@mui/material';

import { GradeMark } from '../../../core/components/grade-mark';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { reorderArray } from '../../../core/utils/reorder-array';

const SORT_ORDER_KEY = 'resultSortOrder:';

interface ParticipantsRanksProps {
  ranks: {
    author: AppUser;
    value: number;
    favorite: boolean;
    myRank: boolean;
  }[];
  sizeFactor: number;
  rankId: string;
}

const UserRankItem: FC<{ author: AppUser; value: number; favorite: boolean; myRank: boolean; sizeFactor: number }> = ({
  author,
  favorite,
  myRank,
  value,
  sizeFactor,
}) => (
  <Grid
    sx={{ width: 120 * sizeFactor, height: 120 * sizeFactor, position: 'relative', cursor: 'grab' }}
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
        color: (theme) => (myRank ? '#00fff9' : theme.palette.text.primary),
        textShadow: (theme) =>
          `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
      }}
      fontSize={author.displayName.length <= 10 ? 18 * sizeFactor : '1em'}
      fontWeight="bold"
      whiteSpace="nowrap"
    >
      {author.displayName}
    </Typography>
    <Avatar
      sx={{
        width: 70 * sizeFactor,
        height: 70 * sizeFactor,
        borderRadius: 2,
        border: (theme) => `2px solid ${!favorite ? theme.palette.grey[900] : theme.palette.error.main}`,
      }}
      alt={author.displayName}
      src={author.photoURL}
      variant="square"
    />
    {favorite && (
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
        value={value}
        showDecimal={1}
        isAuthorRank={myRank}
      />
    </Box>
  </Grid>
);

const SortableItem = SortableElement<ComponentProps<typeof UserRankItem>>(UserRankItem);

const SortableList = SortableContainer<{ items: ParticipantsRanksProps['ranks']; sizeFactor: number }>((({
  items,
  sizeFactor,
}) => {
  return (
    <Grid container flexDirection="row" wrap="wrap" justifyContent="space-around" alignContent="start">
      {items.map((item, index) => (
        <SortableItem key={item.author.uid} {...item} sizeFactor={sizeFactor} index={index} />
      ))}
    </Grid>
  );
}) as FC<{ items: ParticipantsRanksProps['ranks']; sizeFactor: number }>);

export const ParticipantsRanks = memo(({ ranks, sizeFactor, rankId }: ParticipantsRanksProps) => {
  const [order, setOrder] = useState<string[]>(
    () =>
      JSON.parse(sessionStorage.getItem(`${SORT_ORDER_KEY}${rankId}`) || 'null') ||
      ranks.map((item) => item.author.uid),
  );

  useEffect(() => {
    sessionStorage.setItem(`${SORT_ORDER_KEY}${rankId}`, JSON.stringify(order));
  }, [order, rankId]);

  const handleDragEnd: SortEndHandler = ({ newIndex, oldIndex }) => {
    setOrder((prevOrder) => reorderArray(prevOrder, oldIndex, newIndex));
  };

  const rankById = useMemo<Record<string, ParticipantsRanksProps['ranks'][number]>>(
    () => ranks.reduce((acc, val) => ({ ...acc, [val.author.uid]: val }), {}),
    [ranks],
  );

  const items = useMemo(() => order.map((id) => rankById[id]), [rankById, order]);

  return <SortableList axis="xy" items={items} sizeFactor={sizeFactor} onSortEnd={handleDragEnd} />;
});
