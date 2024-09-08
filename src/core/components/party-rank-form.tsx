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
import { useTranslation } from 'react-i18next';

import { Checkbox, FormControl, FormControlLabel, FormLabel, Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';

import { AppUser } from '../interfaces/app-user.interface';
import { PartyRankStatus } from '../interfaces/party-rank.interface';
import { SliderNum } from './slider-num';
import { TagsAutocomplete } from './tags-autocomplete';
import { UsersAutocomplete } from './users-autocomplete';

export interface PartyRankFormValues {
  name: string;
  content: string;
  moderators: AppUser[];
  tags: string[];
  requiredQuantity: number;
  deadlineDate: DateTime;
  finishDate: DateTime;
  isPrivate: boolean;
  status: PartyRankStatus;
  allowComments: boolean;
}

interface PartyRankFormProps {
  minDate?: DateTime;
}

export interface PartyRankFormRef {
  getContent: () => string;
}

export const PartyRankForm = forwardRef<PartyRankFormRef, PartyRankFormProps>(({ minDate }, ref) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<PartyRankFormValues>();
  const rteRef = useRef<RichTextEditorRef>(null);
  const { t } = useTranslation();

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
            required: t('CREATE_RANK.NAME_REQUIRED'),
          }}
          render={({ field }) => (
            <TextField
              fullWidth
              label={t('CREATE_RANK.NAME')}
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
              <FormLabel>{t('CREATE_RANK.DESCRIPTION')}</FormLabel>
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
            <SliderNum
              label={t('CREATE_RANK.CONTENDERS_COUNT')}
              max={10}
              min={0}
              step={1}
              unit={t('COMMON.ITEMS_UNIT')}
              {...field}
            />
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
                  label={t('CREATE_RANK.DEADLINE')}
                  ampm={false}
                  minDate={minDate}
                  {...field}
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
                  label={t('CREATE_RANK.VOTING_DEADLINE')}
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
          name="tags"
          control={control}
          render={({ field }) => <TagsAutocomplete label={t('CREATE_RANK.TAGS')} {...field} />}
        />
      </Grid>
      <Grid item>
        <Controller
          name="moderators"
          control={control}
          render={({ field }) => <UsersAutocomplete label={t('CREATE_RANK.MODERATORS')} {...field} />}
        />
      </Grid>
      <Grid item>
        <Controller
          name="allowComments"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} {...field} />}
              label={t('CREATE_RANK.ALLOW_COMMENTS')}
            />
          )}
        />
      </Grid>
      <Grid item>
        <Controller
          name="isPrivate"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} {...field} />}
              label={t('CREATE_RANK.PRIVATE')}
            />
          )}
        />
      </Grid>
    </Grid>
  );
});
