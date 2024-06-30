import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
// @ts-ignore
import YouTubePlayer from 'youtube-player';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';
import { RankPartyPlayerRef } from './rank-party-player';

export interface YoutubePlayerProps {
  link: string;
  loop?: boolean;
  startTime?: number;
  width?: string | number;
  fontSize?: string | number;
  height?: string | number;
  autoplay?: boolean;
  hideControls?: boolean;
  showTimeControls?: boolean;
  onReady?: () => void;
  onPause?: () => void;
  onManualPause?: () => void;
  onPlay?: () => void;
  onManualPlay?: () => void;
}

export const YoutubePlayer = memo(
  forwardRef<RankPartyPlayerRef, YoutubePlayerProps>(
    (
      {
        link,
        width,
        height,
        startTime = 0,
        loop = true,
        autoplay = true,
        showTimeControls = false,
        hideControls = false,
        fontSize,
        onPause = () => {},
        onManualPause = () => {},
        onManualPlay = () => {},
        onPlay = () => {},
        onReady = () => {},
      },
      componentRef,
    ) => {
      const [paused, setPaused] = useState(true);
      const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
      const defaultVolume = useSubscription(defaultVolume$, 1);
      const [ready, setReady] = useState(false);
      const containerRef = useRef<HTMLDivElement>(null);
      const playerRef = useRef<any>(null);

      useEffect(() => {
        const youtubeId = new URLSearchParams((link || '').split('?')?.[1] || '').get('v') || link;

        if (!youtubeId) return;

        playerRef.current = YouTubePlayer(containerRef.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            loop: loop ? 1 : 0,
            playlist: youtubeId,
            showinfo: 0,
            start: startTime ? Math.round(startTime) : 0,
            controls: showTimeControls ? 1 : 0,
            enablejsapi: 1,
          },
        });

        const stateListener = playerRef.current.on('stateChange', ({ data }: any) => {
          if (data === 1) {
            onPlay();
            setPaused(false);
            // onManualPlay();
          }
          if (data === 2) {
            onPause();
            setPaused(true);
            // onManualPause();
          }
        });

        const readyListener = playerRef.current.on('ready', () => {
          setReady(true);
          onReady();
        });

        return () => {
          if (playerRef.current) {
            playerRef.current.off(stateListener);
            playerRef.current.off(readyListener);
            playerRef.current.getVolume().then((value: number) => {
              defaultVolume$.next(value / 100);
            });
            playerRef.current.destroy();
            playerRef.current = null;
          }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [link]);

      useEffect(() => {
        if (playerRef.current) {
          playerRef.current.setVolume((defaultVolume ?? 1) * 100);
        }
      }, [defaultVolume, ready]);

      useImperativeHandle(
        componentRef,
        () => ({
          play: async () => {
            if (playerRef.current) {
              playerRef.current.playVideo();
            }
          },
          pause: () => {
            if (playerRef.current) {
              playerRef.current.pauseVideo();
            }
          },
          setVolume: (value: number) => {
            if (playerRef.current) {
              playerRef.current.setVolume(value * 100);
            }
          },
          getCurrentTimestamp: () => {
            if (playerRef.current) {
              return playerRef.current.getCurrentTime();
            }
            return null;
          },
          playWithTimestamp: (time: number) => {
            if (playerRef.current) {
              playerRef.current.seekTo(Math.round(time));
            }
          },
        }),
        [],
      );

      useEffect(() => {
        if (containerRef.current) {
          if (playerRef.current) {
            playerRef.current.getIframe().then((element: HTMLIFrameElement) => {
              element.style.width = typeof width === 'number' ? `${width}px` : width;
              element.style.height = typeof height === 'number' ? `${height}px` : height;
            });
          }
        }
      }, [width, height]);

      const handleButtonPause = () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
      };

      const handleButtonPlay = () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
        }
      };

      return (
        <Box
          sx={{
            width,
            height,
            opacity: ready ? 1 : 0,
          }}
        >
          {!ready && <LinearProgress />}
          <Box ref={containerRef} />
          {!paused && !hideControls && (
            <IconButton
              onClick={handleButtonPause}
              disableRipple
              sx={{
                borderRadius: '50%',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                padding: 3,
                fontSize,
                zIndex: 2,
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
          {paused && !hideControls && (
            <IconButton
              onClick={handleButtonPlay}
              disableRipple
              sx={{
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                padding: 3,
                zIndex: 2,
                position: 'absolute',
                fontSize,
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
      );
    },
  ),
);
