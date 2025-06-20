import { MouseEventHandler, memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import TagIcon from '@mui/icons-material/Tag';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Chip, Grid, IconButton, Popover, SxProps, Tooltip, Typography } from '@mui/material';

import { ConfirmModal } from '../../../core/components/confirm-modal';
import { GradeMark } from '../../../core/components/grade-mark';
import { MediaPreviewModal } from '../../../core/components/media-preview-modal';
import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem, RankItemType } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { UsersList } from './users-list';

interface RankItemProps {
  sx?: SxProps;
  data: IRankItem;
  namePrefix?: string;
  partyStatus?: PartyRankStatus;
  isCreator?: boolean;
  grade?: number;
  isFavorite?: boolean;
  showAuthor?: boolean;
  showCopy?: boolean;
  showRedirect?: boolean;
  showPreviewIcon?: boolean;
  oneLine?: boolean;
  rank?: number;
  favoriteCount?: number;
  userLikesIds?: string[];
  onDelete?: (id: string) => void;
  onClear?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const RankItem = memo(
  ({
    sx,
    data,
    namePrefix = '',
    partyStatus = null,
    isCreator = false,
    showPreviewIcon = true,
    oneLine = false,
    showRedirect = false,
    showCopy = true,
    grade = null,
    isFavorite = false,
    onDelete = () => null,
    onClear = () => null,
    onEdit = () => null,
    showAuthor: showAuthorProp = true,
    rank = null,
    favoriteCount = 0,
    userLikesIds = [],
  }: RankItemProps) => {
    const { user$ } = useInjectable(AppTypes.AuthService);
    const currentUser = useSubscription(user$);
    const [showPreview, setShowPreview] = useState(false);
    const [showLikesEl, setShowLikesEl] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const likesContainerRef = useRef();
    const { t } = useTranslation();

    const { author, authorId, name, type, value, startTime, _id } = data;
    const showAuthor =
      (currentUser?._id === authorId || isCreator || partyStatus === PartyRankStatus.Finished) && showAuthorProp;
    const canEdit =
      (partyStatus === PartyRankStatus.Ongoing && (currentUser?._id === authorId || isCreator)) ||
      (partyStatus === PartyRankStatus.Rating && isCreator) ||
      (partyStatus === PartyRankStatus.Registration && isCreator);
    const showTimeWarning =
      canEdit &&
      [PartyRankStatus.Ongoing, PartyRankStatus.Registration].includes(partyStatus) &&
      !startTime &&
      type !== RankItemType.Image;

    const handleDelete = () => {
      setShowDeleteModal(true);
    };

    const handleCloseDelete = () => {
      setShowDeleteModal(false);
    };

    const handleConfirmDelete = () => {
      onDelete(_id);
    };

    const handleClear = () => {
      onClear(_id);
    };

    const handleEdit = () => {
      onEdit(_id);
    };

    const handleView: MouseEventHandler = (event) => {
      event.stopPropagation();
      event.preventDefault();
      setShowPreview(true);
    };

    const handleClosePreview = () => {
      setShowPreview(false);
    };

    const handleViewPartyRank = () => {
      window.open(`/party-rank/${data.partyRankId}`, '_blank');
    };

    const handleCloseLikes: MouseEventHandler<HTMLDivElement> = (event) => {
      setShowLikesEl(null);
    };

    const handleCopyName = () => {
      navigator.clipboard.writeText(name);
    };

    const handleShowLikes: MouseEventHandler<HTMLDivElement> = (event) => {
      setShowLikesEl(likesContainerRef.current);
    };

    return (
      <>
        <Grid
          sx={{
            pl: 2,
            pr: 2,
            pt: 1,
            pb: 1,
            mt: 2,
            backgroundColor: (theme) => theme.palette.grey[900],
            boxShadow: (theme) => theme.shadows[10],
            ...sx,
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
            {Boolean(rank) && (
              <Chip
                sx={{
                  mr: 2,
                }}
                size="medium"
                avatar={rank === 1 ? <EmojiEventsRoundedIcon /> : <TagIcon />}
                label={<Typography fontWeight="bold">{rank}</Typography>}
                variant="filled"
                color="default"
              />
            )}
            {author && showAuthor && (
              <Chip
                sx={{
                  mr: 1,
                }}
                size="medium"
                avatar={<Avatar alt={author.displayName} src={author.photoURL} />}
                label={author.displayName}
                variant="filled"
              />
            )}
            <Typography
              sx={{
                pr: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              variant="h5"
              component="div"
              whiteSpace={oneLine ? 'nowrap' : 'initial'}
            >
              {namePrefix}
              {name}
            </Typography>
          </Grid>
          <Grid container flex={0} direction="row" alignItems="center" justifyContent="flex-end" wrap="nowrap">
            <Grid
              sx={{
                mr: showPreviewIcon ? 2 : 0,
              }}
              flex={0}
              container
              item
              direction="row"
              alignItems="center"
              wrap="nowrap"
            >
              {isFavorite && (
                <FavoriteIcon
                  sx={{
                    mr: grade ? 2 : 1,
                  }}
                  color="error"
                />
              )}
              {favoriteCount > 0 && (
                <>
                  <Popover
                    open={Boolean(showLikesEl)}
                    anchorEl={showLikesEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    onClose={handleCloseLikes}
                  >
                    <UsersList userIds={userLikesIds} />
                  </Popover>
                  <Box
                    ref={likesContainerRef}
                    sx={{
                      mr: 2,
                      zIndex: 1,
                      cursor: 'pointer',
                    }}
                    onClick={handleShowLikes}
                  >
                    <Chip
                      sx={{ position: 'relative', zIndex: 0 }}
                      size="small"
                      avatar={<FavoriteIcon />}
                      label={`${favoriteCount}`}
                      variant="filled"
                      color="error"
                    />
                  </Box>
                </>
              )}
              {typeof grade === 'number' && <GradeMark size={32} value={grade} />}
            </Grid>
            {showTimeWarning && (
              <Tooltip placement="top" title={t('RANK.TIME_WARNING')}>
                <TimerOffIcon sx={{ mr: 2 }} color="warning" fontSize="medium" />
              </Tooltip>
            )}
            {showCopy && (
              <Tooltip placement="top" title={t('RANK.COPY_NAME')}>
                <IconButton onClick={handleCopyName} aria-label="view">
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {showPreviewIcon && (
              <Tooltip placement="top" title={t('RANK.MEDIA_PREVIEW')}>
                <IconButton onClick={handleView} aria-label="view">
                  <VisibilityIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip placement="top" title={t('RANK.EDIT_ITEM')}>
                <IconButton onClick={handleEdit} aria-label="edit">
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip placement="top" title={t('RANK.DELETE_ITEM')}>
                <IconButton onClick={handleDelete} aria-label="delete">
                  <DeleteIcon color="error" fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {partyStatus === PartyRankStatus.Rating && Boolean(grade) && (
              <Tooltip placement="top" title={t('RANK.DELETE_RANK')}>
                <IconButton onClick={handleClear} aria-label="clear">
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {showRedirect && (
              <Tooltip placement="top" title={t('RANK.REDIRECT')}>
                <IconButton onClick={handleViewPartyRank} aria-label="delete">
                  <ShortcutIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
        {showDeleteModal && (
          <ConfirmModal
            title={name}
            text={t('RANK.DELETE_ITEM_CONFIRMATION')}
            onClose={handleCloseDelete}
            onConfirm={handleConfirmDelete}
          />
        )}
        {showPreview && (
          <MediaPreviewModal onClose={handleClosePreview} src={value} startTime={startTime} title={name} type={type} />
        )}
      </>
    );
  },
);
