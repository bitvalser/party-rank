import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { finalize } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Fab,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Modal,
  Typography,
  useTheme,
} from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import { PartyRankStatus } from '../../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem, RankItemType } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { RankItem } from './rank-item';
import { RankItemForm } from './rank-item-form';

export interface RankItemFromValues {
  authorId: string;
  name: string;
  type: RankItemType;
  value: string;
  startTime: number;
  metadata: Record<string, any>;
}

const DEFAULT_VALUES: RankItemFromValues = {
  authorId: null,
  name: '',
  type: RankItemType.Video,
  value: '',
  startTime: 0,
  metadata: {},
};

export interface AddNewItemProps {
  isCreator?: boolean;
  partyId: string;
  items: IRankItem[];
  disabled?: boolean;
  current: number;
  required: number;
  flags?: Record<string, boolean>;
  onAddNew?: (item: IRankItem) => void;
}

export const AddNewItem = ({
  partyId,
  disabled = false,
  onAddNew = () => null,
  isCreator = false,
  items = [],
  current,
  required,
  flags,
}: AddNewItemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conflictItem, setConflictItem] = useState(null);
  const { t } = useTranslation();
  const fuseSearch = useMemo(
    () =>
      new Fuse(items, {
        keys: ['name'],
        isCaseSensitive: false,
        minMatchCharLength: 8,
        includeScore: true,
      }),
    [items],
  );
  const { addRankItem } = useInjectable(AppTypes.PartyRanks);
  const theme = useTheme();
  const form = useForm<RankItemFromValues>({
    defaultValues: DEFAULT_VALUES,
    reValidateMode: 'onBlur',
  });
  const { handleSubmit } = form;

  const handleOpen = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const onSubmit: SubmitHandler<RankItemFromValues> = (data) => {
    const newConflictItem = fuseSearch.search(data.name, {
      limit: 1,
    })[0];
    if (newConflictItem && !conflictItem) {
      setConflictItem(newConflictItem.item);
    } else {
      setLoading(true);
      addRankItem(partyId, data)
        .pipe(finalize(() => setLoading(false)))
        .subscribe((result) => {
          setLoading(false);
          onAddNew(result);
          setShowModal(false);
          form.reset({ ...DEFAULT_VALUES, authorId: data.authorId });
          setConflictItem(null);
        });
    }
  };

  return (
    <>
      <Modal open={showModal} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            outline: 'none',
            width: 596,
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
              {t('ADD_RANK_ITEM.TITLE')}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <form
            style={{
              display: 'flex',
              flexGrow: 1,
              padding: '16px',
              margin: 0,
              flexDirection: 'column',
              overflow: 'auto',
            }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormProvider {...form}>
              <Grid
                sx={{
                  marginBottom: '6px',
                }}
                container
                flexDirection="column"
                flexGrow={1}
              >
                <RankItemForm showAuthor={isCreator} flags={flags} />
                {conflictItem && (
                  <Grid item xs>
                    <FormLabel>{t('ADD_RANK_ITEM.POSSIBLE_CONFLICT')}</FormLabel>
                    <RankItem sx={{ mt: 0 }} data={conflictItem} partyStatus={PartyRankStatus.Ongoing} oneLine />
                  </Grid>
                )}
                <Grid container item direction="column" justifyContent="flex-end" flexGrow={1}>
                  {!conflictItem && <FormHelperText>{t('ADD_RANK_ITEM.BEFORE_SAVE_WARNING')}</FormHelperText>}
                  {conflictItem && <FormHelperText>{t('ADD_RANK_ITEM.CONFLICT_WARNING')}</FormHelperText>}
                  <Grid item>
                    <Button fullWidth type="submit" variant="contained" disabled={loading}>
                      {t('ADD_RANK_ITEM.SUBMIT')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </FormProvider>
          </form>
        </Box>
      </Modal>
      <Fab
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        size="medium"
        onClick={handleOpen}
        color="primary"
        variant="extended"
        aria-label="Add New"
        disabled={disabled}
      >
        <AddIcon sx={{ mr: 1 }} />
        {t('ADD_RANK_ITEM.ADD_CONTENDER', { current, required })}
      </Fab>
    </>
  );
};
