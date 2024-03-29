import { MouseEventHandler, memo, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Chip, Grid, IconButton, Modal, Popover, SxProps, Tooltip, Typography } from '@mui/material';

import { GradeMark } from '../../../core/components/grade-mark';
import { RankPartyPlayer } from '../../../core/components/rank-party-player';
import { useInjectable } from '../../../core/hooks/useInjectable';
import useSubscription from '../../../core/hooks/useSubscription';
import { PartyRankStatus } from '../../../core/interfaces/party-rank.interface';
import { RankItem as IRankItem } from '../../../core/interfaces/rank-item.interface';
import { AppTypes } from '../../../core/services/types';
import { UsersList } from './users-list';

interface RankItemProps {
  sx?: SxProps;
  data: IRankItem;
  partyStatus: PartyRankStatus;
  isCreator?: boolean;
  grade?: number;
  isFavorite?: boolean;
  showAuthor?: boolean;
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
    partyStatus,
    isCreator = false,
    oneLine = false,
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
    const likesContainerRef = useRef();

    const { author, authorId, name, type, value, id } = data;
    const showAuthor =
      (currentUser?.uid === authorId || isCreator || partyStatus === PartyRankStatus.Finished) && showAuthorProp;
    const canDelete = currentUser?.uid === authorId || isCreator;

    const handleDelete = () => {
      onDelete(id);
    };

    const handleClear = () => {
      onClear(id);
    };

    const handleEdit = () => {
      onEdit(id);
    };

    const handleView = () => {
      setShowPreview(true);
    };

    const handleClosePreview = () => {
      setShowPreview(false);
    };

    const handleCloseLikes: MouseEventHandler<HTMLDivElement> = (event) => {
      setShowLikesEl(null);
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
              {name}
            </Typography>
          </Grid>
          <Grid container flex={0} direction="row" alignItems="center" justifyContent="flex-end" wrap="nowrap">
            <Grid
              sx={{
                mr: 2,
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
              {grade && <GradeMark size={32} value={grade} />}
            </Grid>
            <Tooltip placement="top" title="Превью медиа">
              <IconButton onClick={handleView} aria-label="view">
                <VisibilityIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            {partyStatus === PartyRankStatus.Ongoing && canDelete && (
              <Tooltip placement="top" title="Редактировать предложение">
                <IconButton onClick={handleEdit} aria-label="edit">
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {partyStatus === PartyRankStatus.Ongoing && canDelete && (
              <Tooltip placement="top" title="Удалить предложение">
                <IconButton onClick={handleDelete} aria-label="delete">
                  <DeleteIcon color="error" fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            {partyStatus === PartyRankStatus.Rating && Boolean(grade) && (
              <Tooltip placement="top" title="Удалить оценку">
                <IconButton onClick={handleClear} aria-label="clear">
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
        <Modal open={showPreview} onClose={handleClosePreview}>
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
                  {name}
                </Typography>
              </Grid>
              <Grid xs={1} container item direction="row" justifyContent="flex-end">
                <IconButton onClick={handleClosePreview}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
            <RankPartyPlayer type={type} value={value} showTimeControls />
          </Box>
        </Modal>
      </>
    );
  },
);
