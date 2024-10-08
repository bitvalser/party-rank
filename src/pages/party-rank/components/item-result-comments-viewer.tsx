import { memo, useEffect, useRef, useState } from 'react';

import { Box, Typography, keyframes } from '@mui/material';

import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { seedRandNumber } from '../../../core/utils/seed-rand-number';

const DEFAULT_PLAY_TIME = 15;
const MIN_START_TIME = 5;

const getType = (text: string): string => {
  if (text.startsWith('[img]')) {
    return 'image';
  }
  return 'text';
};

const getDuration = (text: string): number => {
  const type = getType(text);
  if (type !== 'text') {
    return 8 + Math.random() * 4 - 2;
  }
  if (text?.length < 6) {
    return 6;
  } else if (text?.length <= 30) {
    return 10;
  } else if (text?.length <= 30) {
    return 12;
  } else if (text?.length > 60) {
    return 16;
  }
  return 10;
};

const getFontSize = (text: string): number => {
  if (text?.length < 2) {
    return 46;
  } else if (text?.length < 8) {
    return 32;
  }
  return 24;
};

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
  comments: RankItem['comments'];
}

export const ItemResultCommentsViewer = memo(({ comments: rankComments }: ItemResultCommentsViewerProps) => {
  const comments = rankComments || [];
  const commentsPerSecond = Math.min(Math.ceil((DEFAULT_PLAY_TIME - 5) / comments.length), MIN_START_TIME);

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
        const rand = seedRandNumber(comment._id);
        const type = getType(comment.body);
        const options =
          type !== 'text'
            ? Object.fromEntries(
                comment.body
                  .replace(/\[(.*)\]/, '')
                  .split('@')
                  .map((option) => option.split(':=')),
              )
            : null;
        return (
          <Box
            sx={{
              position: 'absolute',
              top: `calc(${Math.floor(rand * 89)}% + 60px - ${type === 'image' ? 60 : 0}px)`,
              transform: 'translateX(100%)',
              animation: `${movingEffect} ${getDuration(comment.body)}s linear`,
              animationDelay: `${i * commentsPerSecond + (rand - 0.5)}s`,
              right: 0,
            }}
          >
            {type === 'image' && (
              <img
                style={{
                  objectFit: 'contain',
                  maxHeight: 165,
                  maxWidth: 165,
                  overflow: 'hidden',
                  maskImage:
                    'linear-gradient(to top, black 0%, black 100%), linear-gradient(to top, transparent 0%, black 100%), linear-gradient(to right, transparent 0%, black 100%), linear-gradient(to bottom, transparent 0%, black 100%), linear-gradient(to left, transparent 0%, black 100%)',
                  maskPosition: 'center, top, right, bottom, left',
                  maskSize: '100% 100%, 100% 5px, 5px 100%, 100% 5px, 5px 100%',
                  maskRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
                  maskComposite: 'subtract, add, add, add',
                }}
                src={options.src}
                alt={`Comment ${comment._id}`}
              />
            )}
            {type === 'text' && (
              <Typography
                sx={{
                  fontSize: getFontSize(comment.body),
                  whiteSpace: 'nowrap',
                  textShadow: (theme) =>
                    `2px 0 ${theme.palette.background.default}, -2px 0 ${theme.palette.background.default}, 0 2px ${theme.palette.background.default}, 0 -2px ${theme.palette.background.default}, 1px 1px ${theme.palette.background.default}, -1px -1px ${theme.palette.background.default}, 1px -1px ${theme.palette.background.default}, -1px 1px ${theme.palette.background.default}`,
                }}
                key={comment._id}
              >
                {comment.body}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
});
