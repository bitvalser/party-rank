import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
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
}

const DEFAULT_VALUES: RankItemFromValues = {
  authorId: null,
  name: '',
  type: RankItemType.Video,
  value: '',
  startTime: 0,
};

export interface AddNewItemProps {
  isCreator?: boolean;
  partyId: string;
  items: IRankItem[];
  disabled?: boolean;
  onAddNew?: (item: IRankItem) => void;
}

export const AddNewItem = ({
  partyId,
  disabled = false,
  onAddNew = () => null,
  isCreator = false,
  items = [],
}: AddNewItemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conflictItem, setConflictItem] = useState(null);
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
          form.reset();
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
              Добавить новый элемент
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
                <RankItemForm showAuthor={isCreator} />
                {conflictItem && (
                  <Grid item xs>
                    <FormLabel>Возможный конфликт!</FormLabel>
                    <RankItem sx={{ mt: 0 }} data={conflictItem} partyStatus={PartyRankStatus.Ongoing} oneLine />
                  </Grid>
                )}
                <Grid container item direction="column" justifyContent="flex-end" flexGrow={1}>
                  {!conflictItem && (
                    <FormHelperText>
                      Прежде чем сохранить элемент убедитесь что превью работает нормально и показывает ваш медиа файл!
                    </FormHelperText>
                  )}
                  {conflictItem && (
                    <FormHelperText>
                      Возможно ваш вариант уже был добавлен другим участником, пожалуйста перепроверьте прежде чем
                      сохранить
                    </FormHelperText>
                  )}
                  <Grid item>
                    <Button fullWidth type="submit" variant="contained" disabled={loading}>
                      Добавить предложение
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
        Добавить предложение
      </Fab>
    </>
  );
};
