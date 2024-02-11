import { useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { finalize } from 'rxjs/operators';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Fab,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { RankPartyPlayer } from '../../../core/components/rank-party-player';
import { useInjectable } from '../../../core/hooks/useInjectable';
import { RankItem, RankItemType } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { validURL } from '../../../core/utils/valid-url';

interface RankItemFromValues {
  name: string;
  type: RankItemType;
  value: string;
}

const DEFAULT_VALUES: RankItemFromValues = {
  name: '',
  type: RankItemType.Video,
  value: '',
};

export interface AddNewItemProps {
  partyId: string;
  disabled?: boolean;
  onAddNew?: (item: RankItem) => void;
}

export const AddNewItem = ({ partyId, disabled = false, onAddNew = () => null }: AddNewItemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addRankItem } = useInjectable(AppTypes.PartyRanks);
  const theme = useTheme();
  const form = useForm<RankItemFromValues>({
    defaultValues: DEFAULT_VALUES,
    reValidateMode: 'onBlur',
  });
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

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

  const type = watch('type');
  const value = watch('value');

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
                <Grid container rowSpacing={2} flexDirection="column">
                  <Grid item>
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        minLength: 3,
                        required: 'Название обязательное поле!',
                      }}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label="Название"
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message as string}
                          {...field}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel id="type-group-label">Тип медиа</FormLabel>
                          <RadioGroup
                            aria-labelledby="type-group-label"
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                            }}
                            {...field}
                          >
                            <FormControlLabel value={RankItemType.Video} control={<Radio />} label="Видео" />
                            <FormControlLabel value={RankItemType.Audio} control={<Radio />} label="Аудио" />
                            <FormControlLabel value={RankItemType.Image} control={<Radio />} label="Изображение" />
                            <FormControlLabel value={RankItemType.YouTube} control={<Radio />} label="YouTube" />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item>
                    <Controller
                      name="value"
                      control={control}
                      rules={{
                        required: 'Ссылка обязательное поле!',
                        validate: (value) => (validURL(value) ? null : 'Ссылка должна быть действительной!'),
                      }}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label="Ссылка на медиа файл"
                          error={Boolean(errors.value)}
                          helperText={errors.value?.message as string}
                          {...field}
                        />
                      )}
                    />
                    {[RankItemType.Audio, RankItemType.Video].includes(type) && (
                      <FormHelperText>
                        Ссылка должна ввести напрямую на файл (будет иметь разрешение .mp4, .ogg и тд). Возможно сначала
                        нужно будет залить файл на CDN.
                      </FormHelperText>
                    )}
                  </Grid>
                  <Grid
                    sx={{
                      height: 250,
                    }}
                    item
                  >
                    <FormLabel id="anime-provider-group-label">Превью</FormLabel>
                    <RankPartyPlayer key={value} type={type} value={value} />
                  </Grid>
                </Grid>
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
          position: 'absolute',
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
