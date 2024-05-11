import { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { finalize } from 'rxjs/operators';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Fab, FormHelperText, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { RankItemFromValues } from './add-new-item';
import { RankItemForm } from './rank-item-form';

export interface EditRankItemProps {
  partyId: string;
  rankValues: RankItem;
  onEdit?: (item: RankItem) => void;
  onClose?: () => void;
}

export const EditRankItem = ({ partyId, onEdit = () => null, rankValues, onClose }: EditRankItemProps) => {
  const [loading, setLoading] = useState(false);
  const { updateRankItem } = useInjectable(AppTypes.PartyRanks);
  const theme = useTheme();
  const { t } = useTranslation();
  const form = useForm<RankItemFromValues>({
    defaultValues: rankValues,
    reValidateMode: 'onBlur',
  });
  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<RankItemFromValues> = (data) => {
    setLoading(true);
    const payload: Partial<RankItem> = { ...data };
    delete payload.author;
    delete payload.authorId;
    delete payload.id;
    updateRankItem(partyId, rankValues.id, payload)
      .pipe(finalize(() => setLoading(false)))
      .subscribe((result) => {
        setLoading(false);
        onEdit(result);
        form.reset(result);
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
          padding: 2,
          outline: 'none',
          width: 596,
          minHeight: 700,
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
            marginBottom: '6px',
          }}
          container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid xs item>
            <Typography
              sx={{
                lineHeight: '22px',
              }}
              variant="h6"
              component="h2"
            >
              {t('CREATE_RANK.EDIT_TITLE', { name: rankValues.name })}
            </Typography>
          </Grid>
          <IconButton onClick={onClose}>
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
            >
              <RankItemForm autoplay={false} />
              <Grid container item direction="column" justifyContent="flex-end" flexGrow={1}>
                <FormHelperText>{t('CREATE_RANK.BEFORE_SAVE_WARNING')}</FormHelperText>
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
                    {t('CREATE_RANK.SAVE_CHANGES')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </FormProvider>
        </form>
      </Box>
    </Modal>
  );
};
