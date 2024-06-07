import { memo, useEffect, useRef, useState } from 'react';

import { Box, Typography, keyframes } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { seedRandNumber } from '../../../core/utils/seed-rand-number';

const DEFAULT_PLAY_TIME = 15;

const movingEffect = keyframes`
  0% {
    right: 0;
    transform: translateX(100%);
  }
  100% {
    right: 100%;
    transform: translateX(-100%);
  }
`;

interface ItemResultCommentsViewerProps {
  rankItem: RankItem;
}

export const ItemResultCommentsViewer = memo(({ rankItem }: ItemResultCommentsViewerProps) => {
  const comments = rankItem.comments || [];
  const commentsPerSecond = Math.ceil((DEFAULT_PLAY_TIME - 5) / comments.length);

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100% - 80px)',
        position: 'absolute',
        overflow: 'hidden',
        top: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      {comments.map((comment, i) => {
        const rand = seedRandNumber(comment.id);
        return (
          <Typography
            sx={{
              position: 'absolute',
              top: `calc(${Math.floor(rand * 90)}% + 60px)`,
              transform: 'translateX(100%)',
              animation: `${movingEffect} 10s linear`,
              animationDelay: `${i * commentsPerSecond + (rand - 0.5)}s`,
              right: 0,
              fontSize: 24,
              whiteSpace: 'nowrap',
              textShadow: (theme) =>
                `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
            }}
            key={comment.id}
          >
            {comment.body}
          </Typography>
        );
      })}
    </Box>
  );
});
