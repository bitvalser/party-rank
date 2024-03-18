import { useRef, useState } from 'react';
import { finalize } from 'rxjs/operators';

import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import { AppTypes } from '../../core/services/types';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const UploadPage = () => {
  const { uploadFile } = useInjectable(AppTypes.UploadService);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>();

  const handleFileChange = () => {
    if (fileInputRef.current.files.length === 1) {
      setUploading(true);
      uploadFile(fileInputRef.current.files[0])
        .pipe(finalize(() => setUploading(false)))
        .subscribe((result) => {
          console.log(result);
          fileInputRef.current.value = '';
        });
    }
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
        }}
      >
        {uploading && <LinearProgress />}
        <CardContent>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              Загрузить медиа файл
            </Typography>
          </Grid>
          <Grid
            sx={{
              marginTop: 1,
              padding: 1,
              paddingBottom: 0,
            }}
            container
            direction="column"
            spacing={1}
          >
            <Grid item>
              <Button
                component="label"
                role={undefined}
                disabled={uploading}
                variant="contained"
                fullWidth
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Upload file
                <VisuallyHiddenInput ref={fileInputRef} onChange={handleFileChange} type="file" accept=".mp3,.mp4" />
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};
