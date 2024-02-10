import { DateTime } from 'luxon';
import { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { finalize } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Fab, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { useInjectable } from '../../../core/hooks/useInjectable';
import { PartyRank, PartyRankStatus } from '../../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../../core/services/types';
import { PartyRankForm, PartyRankFormValues } from './party-rank-form';

const DEFAULT_VALUES: PartyRankFormValues = {
  name: '',
  requiredQuantity: 3,
  deadlineDate: DateTime.now().plus({ days: 1 }),
  finishDate: DateTime.now().plus({ days: 2 }),
  status: PartyRankStatus.Ongoing,
};

const MIN_DATE = DateTime.now().plus({ day: 0.5 });

export interface AddNewPartyProps {
  onAddNew?: (item: PartyRank) => void;
}

export const AddNewParty = ({ onAddNew = () => null }: AddNewPartyProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { createPartyRank } = useInjectable(AppTypes.PartyRanks);
  const form = useForm<PartyRankFormValues>({
    defaultValues: DEFAULT_VALUES,
    reValidateMode: 'onBlur',
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const handleOpen = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const onSubmit: SubmitHandler<PartyRankFormValues> = (data) => {
    const payload = {
      ...data,
      deadlineDate: data.deadlineDate.toISO(),
      finishDate: data.finishDate.toISO(),
    };
    setLoading(true);
    createPartyRank(payload)
      .pipe(finalize(() => setLoading(false)))
      .subscribe((result) => {
        setShowModal(false);
        form.reset();
        onAddNew(result);
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
            minHeight: 400,
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
              Создать новый пати ранк
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
                <PartyRankForm minDate={MIN_DATE} />
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
                      Создать пати ранк
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
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
        onClick={handleOpen}
        color="primary"
        aria-label="Add New"
      >
        <AddIcon />
      </Fab>
    </>
  );
};
