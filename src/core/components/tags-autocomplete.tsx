import { ControllerRenderProps } from 'react-hook-form';

import { Autocomplete, Box, Chip, ListItem, ListItemText, TextField } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { IPartyTag } from '../interfaces/party-tags.interface';
import { AppTypes } from '../services/types';

interface UsersAutocompleteProps extends Partial<ControllerRenderProps> {
  label: string;
}

export const TagsAutocomplete = ({ label, onChange, value, ...rest }: UsersAutocompleteProps) => {
  const { tags$ } = useInjectable(AppTypes.TagsService);
  const tags = useSubscription(tags$, []);

  const handleChange = (event: any, value: IPartyTag[]) => {
    onChange(value.map((item) => item.name));
  };

  const selectedValue = tags.filter((tag) => (value || []).includes(tag.name));

  return (
    <Autocomplete
      {...rest}
      onChange={handleChange}
      value={selectedValue}
      multiple
      options={tags}
      isOptionEqualToValue={(option: IPartyTag, value: IPartyTag) => option._id === value._id}
      getOptionLabel={(option: IPartyTag) => option.name || ''}
      renderInput={(params) => <TextField {...params} label={label} />}
      renderOption={(props, option) => (
        <ListItem {...props}>
          <ListItemText sx={{ textTransform: 'capitalize' }} primary={option.name} />
        </ListItem>
      )}
      renderTags={(value: readonly IPartyTag[], getTagProps) =>
        (value || []).map((option: IPartyTag, index: number) => (
          <Chip
            avatar={
              <Box
                sx={{
                  background: option.color,
                  borderRadius: '50%',
                }}
              />
            }
            size="small"
            variant="filled"
            label={option.name}
            {...getTagProps({ index })}
          />
        ))
      }
    />
  );
};
