import { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { finalize } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Fab, FormHelperText, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import { RankItem, RankItemType } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { RankItemForm } from './rank-item-form';

export interface RankItemFromValues {
  authorId: string;
  name: string;
  type: RankItemType;
  value: string;
}

const DEFAULT_VALUES: RankItemFromValues = {
  authorId: null,
  name: '',
  type: RankItemType.Video,
  value: '',
};

export interface AddNewItemProps {
  isCreator?: boolean;
  partyId: string;
  disabled?: boolean;
  onAddNew?: (item: RankItem) => void;
}

export const AddNewItem = ({
  partyId,
  disabled = false,
  onAddNew = () => null,
  isCreator = false,
}: AddNewItemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    addRankItem(partyId, data)
      .pipe(finalize(() => setLoading(false)))
      .subscribe((result) => {
        setLoading(false);
        onAddNew(result);
        setShowModal(false);
        form.reset();
      });
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
            padding: 2,
            outline: 'none',
            width: 596,
            minHeight: 750,
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
              marginBottom: '6px',
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
              margin: 0,
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
              >
                <RankItemForm showAuthor={isCreator} />
                <Grid container item direction="column" justifyContent="flex-end" flexGrow={1}>
                  <FormHelperText>
                    Прежде чем сохранить элемент убедитесь что превью работает нормально и показывает ваш медиа файл!
                  </FormHelperText>
                  <Grid item>
                    <Button
                      sx={{
                        marginBottom: '10px',
                      }}
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
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
