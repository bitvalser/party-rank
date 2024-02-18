import { useRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { BehaviorSubject } from 'rxjs';
import { filter, finalize, switchMap, take } from 'rxjs/operators';

import { Autocomplete, Avatar, Chip, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppUser } from '../interfaces/app-user.interface';
import { AppTypes } from '../services/types';

interface UsersAutocompleteProps extends Partial<ControllerRenderProps> {
  label: string;
  loadInit?: boolean;
  multiple?: boolean;
}

export const UsersAutocomplete = ({
  label,
  multiple = true,
  loadInit = false,
  onChange,
  value,
  ...rest
}: UsersAutocompleteProps) => {
  const { getAllUsers } = useInjectable(AppTypes.AuthService);
  const startFetchRef = useRef(new BehaviorSubject<boolean>(loadInit));
  const [loading, setLoading] = useState(false);

  const users = useSubscription(
    startFetchRef.current.pipe(
      filter((flag) => flag),
      take(1),
      switchMap(() => getAllUsers()),
      finalize(() => setLoading(false)),
    ),
    [],
  );
  const handleInit = () => {
    startFetchRef.current.next(true);
  };

  const handleChange = (event: any, value: AppUser | AppUser[]) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.map((item) => item.uid));
    }
    if (!multiple && !Array.isArray(value)) {
      onChange(value ? value.uid : null);
    }
  };

  const formattedValue =
    Array.isArray(value) && multiple
      ? users.filter((item) => value.includes(item.uid))
      : users.find((item) => item.uid === value);

  return (
    <Autocomplete
      {...rest}
      onChange={handleChange}
      value={formattedValue}
      onFocus={handleInit}
      multiple={multiple}
      options={users}
      isOptionEqualToValue={(option: AppUser, value: AppUser) => option.uid === value.uid}
      loading={loading}
      getOptionLabel={(option: AppUser) => option.displayName || ''}
      renderInput={(params) => <TextField {...params} label={label} />}
      renderOption={(props, option) => (
        <ListItem {...props}>
          <ListItemAvatar>
            <Avatar alt={option.displayName} src={option.photoURL} />
          </ListItemAvatar>
          <ListItemText primary={option.displayName} />
        </ListItem>
      )}
      renderTags={(value: readonly AppUser[], getTagProps) =>
        (value || []).map((option: AppUser, index: number) => (
          <Chip
            variant="outlined"
            avatar={<Avatar alt={option.displayName} src={option.photoURL} />}
            label={option.displayName}
            {...getTagProps({ index })}
          />
        ))
      }
    />
  );
};
