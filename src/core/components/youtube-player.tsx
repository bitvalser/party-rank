import { ReactEventHandler, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
// @ts-ignore
import YouTubePlayer from 'youtube-player';

import { Box, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';

export interface YoutubePlayerProps {
  link: string;
  loop?: boolean;
  startTime?: number;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  hideControls?: boolean;
  showTimeControls?: boolean;
  onPause?: () => void;
  onManualPause?: () => void;
  onPlay?: () => void;
  onManualPlay?: () => void;
}

export interface YoutubePlayerRef {
  pause: () => void;
  play: () => void;
  setVolume: (value: number) => void;
  getCurrentTime: () => Promise<number>;
}

export const YoutubePlayer = memo(
  forwardRef<YoutubePlayerRef, YoutubePlayerProps>(
    (
      {
        link,
        width,
        height,
        startTime = 0,
        loop = true,
        autoplay = true,
        showTimeControls = false,
        onPause = () => {},
        onManualPause = () => {},
        onManualPlay = () => {},
        onPlay = () => {},
      },
      componentRef,
    ) => {
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
            onManualPlay();
          }
          if (data === 2) {
            onPause();
            onManualPause();
          }
        });

        const readyListener = playerRef.current.on('ready', () => {
          setReady(true);
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
          getCurrentTime: () => {
            if (playerRef.current) {
              return playerRef.current.getCurrentTime();
            }
            return null;
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
        </Box>
      );
    },
  ),
);
