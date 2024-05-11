import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';

import { UsersAutocomplete } from '../../../core/components/users-autocomplete';

export interface SelectUserModelProps {
  onSelect?: (uid: string) => void;
  onClose?: () => void;
}

export const SelectUserModel = ({ onSelect, onClose }: SelectUserModelProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelect = () => {
    onSelect(selectedUser);
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          outline: 'none',
          width: 596,
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
            padding: 2,
          }}
          container
          flexDirection="row"
          justifyContent="space-between"
        >
          <Typography variant="h6" component="h2">
            {t('RANK.ADD_PARTICIPANT')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid
          sx={{
            marginBottom: '6px',
            p: 2,
          }}
          container
          flexDirection="column"
          flexGrow={1}
        >
          <UsersAutocomplete label="Новый участник" multiple={false} onChange={setSelectedUser} value={selectedUser} />
          <Grid item>
            <Button
              sx={{ mt: 2 }}
              onClick={handleSelect}
              fullWidth
              type="submit"
              variant="contained"
              disabled={!selectedUser}
            >
              {t('RANK.ADD_PARTICIPANT_SUBMIT')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};
