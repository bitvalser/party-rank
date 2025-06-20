import { ComponentProps, FC, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SortEndHandler, SortableContainer, SortableElement } from 'react-sortable-hoc';
import { finalize } from 'rxjs/operators';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import { PartyRank } from '../../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { getItemsOrder } from '../../../core/utils/get-items-order';
import { reorderArray } from '../../../core/utils/reorder-array';
import { seededRandom } from '../../../core/utils/seed-rand-array';
import { RankItem } from './rank-item';

interface ItemsReorderModalProps {
  partyRank: PartyRank;
  items: IRankItem[];
  onClose?: () => void;
}

const SortableRankItem: FC<{
  item: IRankItem;
  itemIndex: number;
}> = ({ item, itemIndex }) => (
  <Grid
    item
    sx={{
      ml: 1,
      mr: 1,
      zIndex: 999999,
      userSelect: 'none',
    }}
  >
    <RankItem data={item} namePrefix={`[${itemIndex + 1}] `} showAuthor={false} showCopy={false} />
  </Grid>
);

const SortableItem = SortableElement<ComponentProps<typeof SortableRankItem>>(SortableRankItem);

const SortableList = SortableContainer<{
  items: IRankItem[];
}>((({ items }) => {
  return (
    <Grid container flexDirection="column">
      {items.map((item, index) => (
        <SortableItem key={item.author._id} index={index} itemIndex={index} item={item} />
      ))}
    </Grid>
  );
}) as FC<{ items: IRankItem[] }>);

export const ItemsReorderModal = memo(({ items: rankItems, partyRank, onClose }: ItemsReorderModalProps) => {
  const [loading, setLoading] = useState(false);
  const { updatePartyRank } = useInjectable(AppTypes.PartyRanks);
  const theme = useTheme();
  const { t } = useTranslation();
  const [order, setOrder] = useState<string[]>(() =>
    getItemsOrder(
      partyRank,
      rankItems.map((item) => item._id),
    ),
  );

  const handleDragEnd: SortEndHandler = ({ newIndex, oldIndex }) => {
    setOrder((prevOrder) => reorderArray(prevOrder, oldIndex, newIndex));
  };

  const itemsById = useMemo<Record<string, IRankItem>>(
    () => rankItems.reduce((acc, val) => ({ ...acc, [val._id]: val }), {}),
    [rankItems],
  );

  const items = useMemo(() => order.map((id) => itemsById[id]).filter(Boolean), [itemsById, order]);

  const handleSubmit = () => {
    setLoading(true);
    updatePartyRank(partyRank._id, { itemsOrder: order })
      .pipe(finalize(() => setLoading(false)))
      .subscribe(() => {
        onClose();
      });
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          outline: 'none',
          width: '70vw',
          minHeight: 650,
          maxHeight: '80vh',
          borderRadius: '4px',
          paddingBottom: 0,
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Grid
          sx={{
            padding: 2,
          }}
          container
          flexDirection="row"
          justifyContent="space-between"
        >
          <Typography variant="h6" component="h2">
            {t('RANK.REORDER')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid container xs>
          <SortableList axis="y" items={items} onSortEnd={handleDragEnd} />
        </Grid>
        <Grid sx={{ p: 1 }} container direction="row" justifyContent="flex-end">
          <Grid item>
            <Button onClick={handleSubmit} disabled={loading}>
              {t('RANK.REORDER_SAVE')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
});
