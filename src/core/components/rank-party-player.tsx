import { memo, useRef, useState } from 'react';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton } from '@mui/material';

import { RankItemType } from '../interfaces/rank-item.interface';
import { AudioVisualizer } from './audio-visualizer';

export interface RankPartyPlayer {
  type: RankItemType;
  value: string;
}

export const RankPartyPlayer = memo(({ type, value }: RankPartyPlayer) => {
  const [paused, setPaused] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePause = () => {
    setPaused(true);
  };

  const handlePlay = () => {
    setPaused(false);
  };

  const handleButtonPlay = () => {
    if (videoRef.current.readyState > 1) {
      videoRef.current.play();
    }
  };

  const handleButtonPause = () => {
    if (videoRef.current.readyState > 1) {
      videoRef.current.pause();
    }
  };

  const youtubeId = new URLSearchParams((value || '').split('?')?.[1] || '').get('v') || value;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flex: 1,
      }}
    >
      {type === RankItemType.YouTube && (
        // eslint-disable-next-line jsx-a11y/iframe-has-title
        <iframe
          width="100%"
          height="100%"
          // @ts-expect-error
          frameborder="0"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&showinfo=0&controls=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      )}
      {type === RankItemType.Video && (
        <>
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            onPlay={handlePlay}
            onPause={handlePause}
            loop
            autoPlay
            controls={false}
          >
            <source src={value} />
          </video>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: paused ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            }}
          >
            {!paused && (
              <IconButton
                onClick={handleButtonPause}
                disableRipple
                sx={{
                  borderRadius: '50%',
                  padding: 3,
                  fontSize: '4em',
                  background: 'rgba(0, 0, 0, 0.6)',
                  transition: (theme) =>
                    theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shortest,
                    }),
                  opacity: 0,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <PauseIcon fontSize="inherit" />
              </IconButton>
            )}
            {paused && (
              <IconButton
                onClick={handleButtonPlay}
                disableRipple
                sx={{
                  borderRadius: '50%',
                  padding: 3,
                  fontSize: '4em',
                  background: 'rgba(0, 0, 0, 0.6)',
                  transition: (theme) =>
                    theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shortest,
                    }),
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                <PlayArrowIcon fontSize="inherit" />
              </IconButton>
            )}
          </Box>
        </>
      )}
      {type === RankItemType.Audio && <AudioVisualizer src={value} />}
      {type === RankItemType.Image && (
        <Box
          component="img"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
          }}
          alt="value"
          src={value}
        />
      )}
    </Box>
  );
});
