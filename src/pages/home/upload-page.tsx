import { useRef, useState } from 'react';
import { Subject, merge, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  Card,
  CardContent,
  FormHelperText,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';

import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { AppTypes } from '../../core/services/types';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 16 * 1024 * 1024;

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
  const { uploadFile, deleteFile, getAllFiles } = useInjectable(AppTypes.UploadService);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>();
  const updateListsRef = useRef(new Subject<void>());
  const files = useSubscription(merge(of(void 0), updateListsRef.current).pipe(switchMap(() => getAllFiles())), []);

  const handleFileChange = () => {
    if (fileInputRef.current.files.length === 1) {
      const fileToUpload = fileInputRef.current.files[0];
      if (fileToUpload.size > MAX_FILE_SIZE) {
        setError('Медиа файл превышает допустимый размер в 16мб');
        return;
      }
      setUploading(true);
      setError(null);
      uploadFile(fileToUpload)
        .pipe(finalize(() => setUploading(false)))
        .subscribe({
          next: (result) => {
            if (!result.ok) {
              setError(error?.message || 'Загрузить файл не удалось :(');
            } else {
              updateListsRef.current.next();
            }
            fileInputRef.current.value = '';
          },
          error: (error) => {
            setError(error?.message || 'Загрузить файл не удалось :(');
            fileInputRef.current.value = '';
          },
        });
    }
  };

  const handleDelete = (id: string) => () => {
    deleteFile(id).subscribe(() => {
      updateListsRef.current.next();
    });
  };

  const handleView = (link: string) => () => {
    window.open(link, '_blank');
  };

  const handleCopy = (link: string) => () => {
    navigator.clipboard.writeText(link);
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
                disabled={uploading || files.length >= MAX_FILES}
                variant="contained"
                fullWidth
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
              >
                Upload file
                <VisuallyHiddenInput ref={fileInputRef} onChange={handleFileChange} type="file" accept=".mp3,.mp4" />
              </Button>
            </Grid>
            {error && (
              <Grid item>
                <FormHelperText error>{error}</FormHelperText>
              </Grid>
            )}
            {files.length >= MAX_FILES && (
              <Grid item>
                <FormHelperText error>Достигнут лимит на количество файлов</FormHelperText>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      {files.length > 0 && (
        <Card
          sx={{
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" component="div">
                Мои файлы
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
            >
              {files.map((file) => (
                <Grid
                  key={file.id}
                  sx={{
                    pl: 2,
                    pr: 2,
                    pt: 1,
                    pb: 1,
                    mt: 2,
                    backgroundColor: (theme) => theme.palette.grey[900],
                    boxShadow: (theme) => theme.shadows[10],
                  }}
                  container
                  direction="row"
                  alignItems="center"
                  wrap="nowrap"
                >
                  <Grid
                    sx={{
                      overflow: 'hidden',
                    }}
                    xs
                    container
                    direction="row"
                    alignItems="center"
                    wrap="nowrap"
                  >
                    <Typography
                      sx={{
                        pr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      variant="h5"
                      component="div"
                    >
                      {file.name}
                    </Typography>
                  </Grid>
                  <Grid container flex={0} direction="row" alignItems="center" justifyContent="flex-end" wrap="nowrap">
                    <Tooltip placement="top" title="Превью медиа">
                      <IconButton onClick={handleView(file.url)} aria-label="view">
                        <OpenInNewIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title="Скопировать ссылку">
                      <IconButton onClick={handleCopy(file.url)} aria-label="view">
                        <LinkIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title="Удалить медиа файл">
                      <IconButton onClick={handleDelete(file.id)} aria-label="delete">
                        <DeleteIcon color="error" fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
};
