import { DateTime } from 'luxon';
import { useRef, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { finalize } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Fab, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { PartyRankForm, PartyRankFormRef, PartyRankFormValues } from '../../../core/components/party-rank-form';
import { useInjectable } from '../../../core/hooks/useInjectable';
import { PartyRank, PartyRankStatus } from '../../../core/interfaces/party-rank.interface';
import { AppTypes } from '../../../core/services/types';

const DEFAULT_VALUES: PartyRankFormValues = {
  name: '',
  content: '',
  moderators: [],
  requiredQuantity: 3,
  deadlineDate: DateTime.now().plus({ days: 1 }),
  finishDate: DateTime.now().plus({ days: 2 }),
  status: PartyRankStatus.Registration,
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
  const formRef = useRef<PartyRankFormRef>();
  const form = useForm<PartyRankFormValues>({
    defaultValues: DEFAULT_VALUES,
    reValidateMode: 'onBlur',
  });
  const { t } = useTranslation();
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
      content: formRef.current.getContent() || '',
      showTable: false,
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
            width: 760,
            minHeight: 700,
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
              {t('CREATE_RANK.TITLE')}
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
                <PartyRankForm ref={formRef} minDate={MIN_DATE} />
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
                      {t('CREATE_RANK.SUBMIT')}
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
        onClick={handleOpen}
        color="primary"
        aria-label="Add New"
      >
        <AddIcon />
      </Fab>
    </>
  );
};
