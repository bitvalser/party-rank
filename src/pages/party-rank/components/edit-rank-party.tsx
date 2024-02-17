import { DateTime } from 'luxon';
import { useMemo, useRef, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { finalize } from 'rxjs/operators';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Fab, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { PartyRankForm, PartyRankFormRef, PartyRankFormValues } from '../../../core/components/party-rank-form';
import { useInjectable } from '../../../core/hooks/useInjectable';
import { PartyRank } from '../../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../../core/services/types';

export interface EditRankPartyProps {
  rankParty: PartyRank;
  onEdit?: (item: PartyRank) => void;
  onClose?: () => void;
}

export const EditRankParty = ({ rankParty, onClose = () => null, onEdit = () => null }: EditRankPartyProps) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { updatePartyRank } = useInjectable(AppTypes.PartyRanks);
  const formRef = useRef<PartyRankFormRef>();
  const initialValues = useMemo(
    () => ({
      ...rankParty,
      deadlineDate: DateTime.fromISO(rankParty.deadlineDate),
      finishDate: DateTime.fromISO(rankParty.finishDate),
    }),
    [rankParty],
  );
  const form = useForm<PartyRankFormValues>({
    defaultValues: initialValues,
    reValidateMode: 'onBlur',
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit: SubmitHandler<PartyRankFormValues> = (data) => {
    const payload = {
      ...data,
      content: formRef.current.getContent() || '',
      deadlineDate: data.deadlineDate.toISO(),
      finishDate: data.finishDate.toISO(),
    };
    setLoading(true);
    updatePartyRank(rankParty.id, payload)
      .pipe(finalize(() => setLoading(false)))
      .subscribe((result) => {
        form.reset();
        onEdit(result);
      });
  };

  const { name } = rankParty;

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
          width: 760,
          minHeight: 600,
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
            Редактировать {name}
          </Typography>
          <IconButton onClick={onClose}>
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
              <PartyRankForm ref={formRef} />
              <Grid container item direction="column" justifyContent="flex-end" flexGrow={1}>
                <Grid item>
                  <Button
                    sx={{
                      marginBottom: '10px',
                    }}
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || !isValid}
                  >
                    Сохранить изменения
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
