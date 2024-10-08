import { ChangeEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { map } from 'rxjs/operators';
import { useThrottledCallback } from 'use-debounce';

import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import { Card, FormHelperText, Grid, IconButton, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import useSubscription from '../../../core/hooks/useSubscription';
import { AppUser } from '../../../core/interfaces/app-user.interface';
import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { IRankItemCommentsManager } from '../../../core/services/rank-item-comments/rank-item-comments.types';

const COMMENT_MAX_LENGTH = 120;

interface RankItemCommentProps {
  partyRankId: string;
  rankItem: RankItem;
  currentUser: AppUser;
  rankItemCommentsManager: IRankItemCommentsManager;
}

export const RankItemComment = ({
  partyRankId,
  rankItem,
  currentUser,
  rankItemCommentsManager,
}: RankItemCommentProps) => {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { partyItemsComments$, addRankItemComment, removeRankItemComment } = rankItemCommentsManager;
  const currentComment = useSubscription(
    partyItemsComments$.pipe(
      map((partyItemsComments) =>
        (partyItemsComments[rankItem._id]?.comments || []).find((comment) => comment.authorId === currentUser._id),
      ),
    ),
  );

  useEffect(() => {
    if (currentComment) {
      setText(currentComment.body);
    }
  }, [currentComment]);

  const handleAddComment = useThrottledCallback(
    () => {
      setError(null);
      addRankItemComment(rankItem._id, text).subscribe({
        error: (error) => {
          setError(error?.message || error);
        },
      });
    },
    1000,
    { trailing: false },
  );

  const handleRemoveComment = () => {
    if (currentComment) {
      removeRankItemComment(rankItem._id, currentComment).subscribe(() => {
        setText('');
      });
    }
  };

  const handleChangeComment: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    setText(event.target.value);
  };

  const isSpecialType = ['[img]'].includes(text.substring(0, 5));

  return (
    <Card sx={{ mb: 2 }}>
      <Grid
        sx={{
          p: 2,
          pt: 1,
          pb: 1,
        }}
        container
        direction="column"
      >
        <Typography>{t('RANK.COMMENT')}</Typography>
        <OutlinedInput
          fullWidth
          autoComplete="off"
          value={text}
          readOnly={Boolean(currentComment)}
          onChange={handleChangeComment}
          type="text"
          inputProps={{
            maxLength: isSpecialType ? 600 : COMMENT_MAX_LENGTH,
          }}
          error={Boolean(error)}
          endAdornment={
            <InputAdornment position="end">
              {!currentComment && (
                <IconButton onClick={handleAddComment} edge="end">
                  <SendIcon />
                </IconButton>
              )}
              {Boolean(currentComment) && (
                <IconButton onClick={handleRemoveComment} edge="end">
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
        {error && <FormHelperText error>{error}</FormHelperText>}
      </Grid>
    </Card>
  );
};
