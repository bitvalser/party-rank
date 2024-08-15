import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subject, merge, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

import { MediaPreviewModal } from '../../core/components/media-preview-modal';
import { useInjectable } from '../../core/hooks/useInjectable';
import useSubscription from '../../core/hooks/useSubscription';
import { RankItemType } from '../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../core/services/types';

const MAX_FILES = 60;
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
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string }>(null);
  const fileInputRef = useRef<HTMLInputElement>();
  const updateListsRef = useRef(new Subject<void>());
  const files = useSubscription(merge(of(void 0), updateListsRef.current).pipe(switchMap(() => getAllFiles())), []);
  const { t } = useTranslation();

  const getRankTypeByMediaUrl = (url: string): RankItemType => {
    if (url.includes('.mp3')) {
      return RankItemType.Audio;
    }
    return RankItemType.Video;
  };

  const handleFileChange = () => {
    if (fileInputRef.current.files.length === 1) {
      const fileToUpload = fileInputRef.current.files[0];
      if (fileToUpload.size > MAX_FILE_SIZE) {
        setError(t('UPLOAD.SIZE_ERROR'));
        return;
      }
      setUploading(true);
      setError(null);
      uploadFile(fileToUpload)
        .pipe(finalize(() => setUploading(false)))
        .subscribe({
          next: (result) => {
            if (!result.ok) {
              setError(error?.message || t('UPLOAD.UPLOAD_ERROR'));
            } else {
              updateListsRef.current.next();
            }
            fileInputRef.current.value = '';
          },
          error: (error) => {
            setError(error?.message || t('UPLOAD.UPLOAD_ERROR'));
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

  const handlePreview = (data: { url: string; name: string }) => () => {
    setPreviewFile(data);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
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
              {t('UPLOAD.UPLOAD_FILE')}
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
                {t('UPLOAD.UPLOAD_FILE_BUTTON')}
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
                <FormHelperText error>{t('UPLOAD.LIMIT_ERROR')}</FormHelperText>
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
                {t('UPLOAD.MY_FILES')}
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
                    <Tooltip placement="top" title={t('UPLOAD.MEDIA_PREVIEW')}>
                      <IconButton onClick={handlePreview({ url: file.url, name: file.name })} aria-label="view">
                        <VisibilityIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title={t('UPLOAD.OPEN_TAB')}>
                      <IconButton onClick={handleView(file.url)} aria-label="view">
                        <OpenInNewIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title={t('UPLOAD.COPE_LINK')}>
                      <IconButton onClick={handleCopy(file.url)} aria-label="view">
                        <LinkIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title={t('UPLOAD.DELETE_FILE')}>
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
      {previewFile && (
        <MediaPreviewModal
          title={previewFile.name}
          type={getRankTypeByMediaUrl(previewFile.url)}
          src={previewFile.url}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};
