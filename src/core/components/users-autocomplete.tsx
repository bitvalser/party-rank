import { ChangeEventHandler, useRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, finalize, map, skip, skipUntil, switchMap } from 'rxjs/operators';

import { Autocomplete, Avatar, Chip, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppUser } from '../interfaces/app-user.interface';
import { AppTypes } from '../services/types';

interface UsersAutocompleteProps extends Partial<ControllerRenderProps> {
  label: string;
  multiple?: boolean;
}

export const UsersAutocomplete = ({ label, multiple = true, onChange, value, ...rest }: UsersAutocompleteProps) => {
  const searchRef = useRef(new BehaviorSubject<string>(''));
  const focusRef = useRef(new Subject<void>());
  const [loading, setLoading] = useState(true);
  const { searchUsers } = useInjectable(AppTypes.UsersService);
  const searchValue = useSubscription(searchRef.current);
  const users = useSubscription(
    searchRef.current.pipe(
      skipUntil(focusRef.current),
      debounceTime(500),
      switchMap((search) => searchUsers({ filters: { name: search }, limit: 15 })),
      map(({ users }) => users),
      finalize(() => setLoading(false)),
    ),
    [],
  );

  const handleFocus = () => {
    focusRef.current.next();
    searchRef.current.next(searchRef.current.getValue());
  };

  const handleChange = (event: any, value: AppUser | AppUser[]) => {
    onChange(value);
  };

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    searchRef.current.next(event.target.value);
  };

  return (
    <Autocomplete
      {...rest}
      onFocus={handleFocus}
      onInput={handleSearchChange}
      inputValue={multiple ? searchValue : value?.displayName}
      onChange={handleChange}
      value={value}
      multiple={multiple}
      options={users}
      isOptionEqualToValue={(option: AppUser, value: AppUser) => option._id === value._id}
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
