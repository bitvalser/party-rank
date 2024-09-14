import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';
import { MediaControls } from './media-controls';
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
      const [paused, setPaused] = useState(false);
      const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
      const defaultVolume = useSubscription(defaultVolume$, 1);
      const [ready, setReady] = useState(false);
      const playerRef = useRef<HTMLElement & any>(null);

      const youtubeId = useMemo(() => new URLSearchParams((link || '').split('?')?.[1] || '').get('v') || link, []);

      useEffect(() => {
        if (!youtubeId) return;

        playerRef.current.addEventListener('loadcomplete', () => {
          setReady(true);
        });
        playerRef.current.addEventListener('play', () => {
          setReady(true);
          onPlay();
          setPaused(false);
        });
        playerRef.current.addEventListener('pause', () => {
          onPause();
          setPaused(true);
        });

        return () => {
          if (playerRef.current) {
            playerRef.current.removeAllEventListeners();
            defaultVolume$.next(playerRef.current.volume);
            playerRef.current = null;
          }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [youtubeId]);

      useEffect(() => {
        if (playerRef.current) {
          playerRef.current.volume = defaultVolume ?? 1;
        }
      }, [defaultVolume, ready]);

      useImperativeHandle(
        componentRef,
        () => ({
          play: async () => {
            if (playerRef.current) {
              playerRef.current.play();
            }
          },
          pause: () => {
            if (playerRef.current) {
              playerRef.current.pause();
            }
          },
          setVolume: (value: number) => {
            if (playerRef.current) {
              playerRef.current.volume = value ?? 1;
            }
          },
          getCurrentTimestamp: () => {
            if (playerRef.current) {
              return playerRef.current.currentTime;
            }
            return null;
          },
          playWithTimestamp: (time: number) => {
            if (playerRef.current) {
              playerRef.current.currentTime = Math.round(time);
            }
          },
        }),
        [],
      );

      const handleButtonPause = () => {
        if (playerRef.current) {
          playerRef.current.pause();
        }
      };

      const handleButtonPlay = () => {
        if (playerRef.current) {
          playerRef.current.play();
        }
      };

      return (
        <>
          {!ready && (
            <LinearProgress
              sx={{
                zIndex: 99,
                position: 'absolute',
                top: 0,
                width: '100%',
              }}
            />
          )}
          <Box
            sx={{
              width,
              height,
              opacity: ready ? 1 : 0,
            }}
          >
            <media-controller>
              <youtube-video
                class="youtube-video"
                ref={playerRef}
                src={link}
                slot="media"
                crossorigin
                autoplay
                loop={loop ? 1 : 0}
                start={startTime ? Math.round(startTime) : 0}
                controls={0}
                enablejsapi={1}
                playsinline
                preload
              ></youtube-video>
              {showTimeControls && <MediaControls />}
            </media-controller>
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
        </>
      );
    },
  ),
);
