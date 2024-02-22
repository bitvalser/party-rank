import { DateTime } from 'luxon';
import {
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from 'mui-tiptap';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormControl, FormLabel, Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';

import { PartyRankStatus } from '../interfaces/party-rank.interface';
import { SliderNum } from './slider-num';
import { UsersAutocomplete } from './users-autocomplete';

export interface PartyRankFormValues {
  name: string;
  content: string;
  moderators: string[];
  requiredQuantity: number;
  deadlineDate: DateTime;
  finishDate: DateTime;
  status: PartyRankStatus;
}

interface PartyRankFormProps {
  initLoadUsers?: boolean;
  minDate?: DateTime;
}

export interface PartyRankFormRef {
  getContent: () => string;
}

export const PartyRankForm = forwardRef<PartyRankFormRef, PartyRankFormProps>(
  ({ minDate, initLoadUsers = false }, ref) => {
    const {
      control,
      watch,
      formState: { errors },
    } = useFormContext<PartyRankFormValues>();
    const rteRef = useRef<RichTextEditorRef>(null);

    const status = watch('status');

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => rteRef.current.editor.getHTML(),
      }),
      [],
    );

    return (
      <Grid
        sx={{
          overflow: 'hidden',
        }}
        container
        rowSpacing={2}
        flexDirection="column"
      >
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
                label="Название \ Тематика"
                error={Boolean(errors.name)}
                helperText={errors.name?.message as string}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid
          sx={{
            width: '100%',
          }}
          item
        >
          <Controller
            name="content"
            control={control}
            rules={{
              required: false,
            }}
            render={({ field }) => (
              <FormControl
                sx={{
                  maxHeight: 250,
                  overflow: 'auto',
                }}
                fullWidth
              >
                <FormLabel>Описание</FormLabel>
                <RichTextEditor
                  ref={rteRef}
                  extensions={[StarterKit, Link]}
                  content={field.value}
                  editable={!field.disabled}
                  renderControls={() => (
                    <MenuControlsContainer>
                      <MenuSelectHeading />
                      <MenuDivider />
                      <MenuButtonBold />
                      <MenuButtonItalic />
                      <MenuButtonCode />
                      <MenuButtonBlockquote />
                      <MenuButtonOrderedList />
                      <MenuButtonBulletedList />
                    </MenuControlsContainer>
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            name="requiredQuantity"
            control={control}
            render={({ field }) => (
              <SliderNum label="Количество предложений от участника" max={10} min={1} step={1} unit="эл." {...field} />
            )}
          />
        </Grid>
        <Grid item>
          <Grid container spacing={1}>
            <Grid item flex={1}>
              <Controller
                name="deadlineDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    sx={{
                      width: '100%',
                    }}
                    format="dd/MM/yyyy HH:mm"
                    label="Дедлайн заявок"
                    ampm={false}
                    minDate={minDate}
                    {...field}
                    disabled={status !== PartyRankStatus.Ongoing}
                  />
                )}
              />
            </Grid>
            <Grid item flex={1}>
              <Controller
                name="finishDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    sx={{
                      width: '100%',
                    }}
                    format="dd/MM/yyyy HH:mm"
                    label="Конец оценивания"
                    ampm={false}
                    minDate={minDate}
                    {...field}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Controller
            name="moderators"
            control={control}
            render={({ field }) => <UsersAutocomplete label="Модераторы" loadInit={initLoadUsers} {...field} />}
          />
        </Grid>
      </Grid>
    );
  },
);
