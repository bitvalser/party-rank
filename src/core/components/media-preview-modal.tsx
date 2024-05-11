import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid, IconButton, Modal, Typography } from '@mui/material';

import { RankItemType } from '../interfaces/rank-item.interface';
import { RankPartyPlayer } from './rank-party-player';

interface MediaPreviewModalProps {
  title: string;
  type: RankItemType;
  src: string;
  onClose: () => void;
}

export const MediaPreviewModal = ({ onClose, title, src, type }: MediaPreviewModalProps) => {
  return (
    <Modal open onClose={onClose}>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 2,
          outline: 'none',
          minWidth: 596,
          maxWidth: 1200,
          minHeight: 400,
          borderRadius: '4px',
          paddingBottom: 0,
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.background.paper,
          [theme.breakpoints.down('md')]: {
            minWidth: '100vw',
            maxWidth: '100vw',
          },
        })}
      >
        <Grid
          sx={{
            marginBottom: '6px',
          }}
          container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid xs item>
            <Typography
              sx={{
                lineHeight: '22px',
              }}
              variant="h6"
              component="h2"
            >
              {title}
            </Typography>
          </Grid>
          <Grid xs={1} container item direction="row" justifyContent="flex-end">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <RankPartyPlayer type={type} value={src} showTimeControls />
      </Box>
    </Modal>
  );
};
