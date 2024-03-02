import {
  ReactEventHandler,
  VideoHTMLAttributes,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';

export interface VideoPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  autoplay?: boolean;
  hideControls?: boolean;
  startTime?: number;
  showTimeControls?: boolean;
  fontSize: string | number;
  onPause?: () => void;
  onManualPause?: () => void;
  onPlay?: () => void;
  onManualPlay?: () => void;
}

export interface VideoPlayerRef {
  pause: () => void;
  play: () => void;
  setVolume: (value: number) => void;
  getCurrentTime: () => number;
}

export const VideoPlayer = memo(
  forwardRef<VideoPlayerRef, VideoPlayerProps>(
    (
      {
        src,
        autoplay = true,
        startTime = 0,
        hideControls = false,
        fontSize,
        showTimeControls = false,
        onPause = () => {},
        onManualPause = () => {},
        onManualPlay = () => {},
        onPlay = () => {},
      },
      componentRef,
    ) => {
      const [paused, setPaused] = useState(true);
      const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
      const defaultVolume = useSubscription(defaultVolume$, 1);
      const videoRef = useRef<HTMLVideoElement>(null);

      useEffect(() => {
        if (videoRef.current) {
          videoRef.current.volume = defaultVolume;
        }
      }, [defaultVolume]);

      useImperativeHandle(
        componentRef,
        () => ({
          play: async () => {
            try {
              await videoRef.current.play();
            } catch (error) {
              console.error(error);
            }
          },
          pause: () => {
            videoRef.current.pause();
          },
          setVolume: (value: number) => {
            videoRef.current.volume = value;
          },
          getCurrentTime: () => {
            return videoRef.current.currentTime;
          },
        }),
        [],
      );

      const handlePause = () => {
        setPaused(true);
        onPause();
      };

      const handlePlay = () => {
        setPaused(false);
        onPlay();
      };

      const handleButtonPlay = () => {
        if (videoRef.current.readyState > 1) {
          videoRef.current.play();
        }
        onManualPlay();
      };

      const handleButtonPause = () => {
        if (videoRef.current.readyState > 1) {
          videoRef.current.pause();
        }
        onManualPause();
      };

      const handleVideoInit: ReactEventHandler<HTMLVideoElement> = (event) => {
        (event.target as HTMLVideoElement).volume = defaultVolume;
        (event.target as HTMLVideoElement).currentTime = startTime;
      };

      const handleVolumeChange = useDebouncedCallback((value: number) => {
        if (typeof value === 'number') {
          defaultVolume$.next(value);
        }
      }, 500);

      return (
        <>
          <video
            ref={videoRef}
            width="100%"
            onLoadStart={handleVideoInit}
            onVolumeChange={(event) => handleVolumeChange((event.target as HTMLVideoElement)?.volume)}
            height="100%"
            onPlay={handlePlay}
            onPause={handlePause}
            loop
            autoPlay={autoplay}
            controls={showTimeControls}
          >
            <source src={src} />
          </video>
          {!hideControls && !showTimeControls && (
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
                zIndex: paused ? 1 : -1,
                backgroundColor: paused ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
              }}
            />
          )}
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
        </>
      );
    },
  ),
);
