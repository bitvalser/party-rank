import { ReactEventHandler, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { RankItemType } from '../interfaces/rank-item.interface';
import { AppTypes } from '../services/types';
import { AudioVisualizer } from './audio-visualizer';

export interface RankPartyPlayer {
  type: RankItemType;
  value: string;
  autoplay?: boolean;
  hideControls?: boolean;
  showTimeControls?: boolean;
  onPause?: () => void;
  onManualPause?: () => void;
  onPlay?: () => void;
  onManualPlay?: () => void;
}

export interface RankPartyPlayerRef {
  pause: () => void;
  play: () => void;
}

export const RankPartyPlayer = memo(
  forwardRef(
    (
      {
        type,
        value,
        autoplay = true,
        hideControls = false,
        showTimeControls = false,
        onPause = () => {},
        onManualPause = () => {},
        onManualPlay = () => {},
        onPlay = () => {},
      }: RankPartyPlayer,
      componentRef,
    ) => {
      const [paused, setPaused] = useState(true);
      const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
      const [waiting, setWaiting] = useState([RankItemType.Audio, RankItemType.Video].includes(type));
      const defaultVolume = useSubscription(defaultVolume$, 1);
      const videoRef = useRef<HTMLVideoElement>(null);
      const audioRef = useRef<HTMLAudioElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const youtubeRef = useRef<HTMLIFrameElement>(null);
      const [clientBoundingRect, setClientBoundingRect] = useState<DOMRect>();

      useEffect(() => {
        setClientBoundingRect(containerRef.current.getBoundingClientRect());
      }, []);

      useEffect(() => {
        if (videoRef.current) {
          videoRef.current.volume = defaultVolume;
        }
        if (audioRef.current) {
          audioRef.current.volume = defaultVolume;
        }
      }, [defaultVolume]);

      useImperativeHandle(
        componentRef,
        () => ({
          play: async () => {
            try {
              switch (type) {
                case RankItemType.Audio:
                  await audioRef.current.play();
                  break;
                case RankItemType.Video:
                  await videoRef.current.play();
                  break;
                case RankItemType.YouTube:
                  youtubeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                  break;
              }
            } catch (error) {
              console.error(error);
            }
          },
          pause: () => {
            switch (type) {
              case RankItemType.Audio:
                audioRef.current.pause();
                break;
              case RankItemType.Video:
                videoRef.current.pause();
                break;
              case RankItemType.YouTube:
                youtubeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                break;
            }
          },
        }),
        [type],
      );

      const handlePause = () => {
        setPaused(true);
        onPause();
      };

      const handlePlay = () => {
        setWaiting(false);
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

      const handleReady = () => {
        setWaiting(false);
      };

      const handleWaiting = () => {
        setWaiting(true);
      };

      const handleVideoInit: ReactEventHandler<HTMLVideoElement> = (event) => {
        (event.target as HTMLVideoElement).volume = defaultVolume;
      };

      const handleAudioInit: ReactEventHandler<HTMLAudioElement> = (event) => {
        (event.target as HTMLAudioElement).volume = defaultVolume;
      };

      const handleVolumeChange = useDebouncedCallback((value: number) => {
        if (typeof value === 'number') {
          defaultVolume$.next(value);
        }
      }, 500);

      const youtubeId = new URLSearchParams((value || '').split('?')?.[1] || '').get('v') || value;
      const fontSize = clientBoundingRect?.height ? `${clientBoundingRect.height / 70}em` : '4em';

      return (
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {waiting && (
            <LinearProgress
              sx={{
                position: 'absolute',
                width: '100%',
                top: 0,
                left: 0,
              }}
            />
          )}
          {type === RankItemType.YouTube && (
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <iframe
              ref={youtubeRef}
              style={{
                width: clientBoundingRect?.width || '100%',
                height: clientBoundingRect?.height || '100%',
              }}
              // @ts-expect-error
              frameborder="0"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&loop=1&showinfo=0&controls=${showTimeControls ? 1 : 0}&enablejsapi=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          )}
          {type === RankItemType.Video && (
            <>
              <video
                onCanPlay={handleReady}
                ref={videoRef}
                width="100%"
                onLoadStart={handleVideoInit}
                onVolumeChange={(event) => handleVolumeChange((event.target as HTMLVideoElement)?.volume)}
                height="100%"
                onPlay={handlePlay}
                onPause={handlePause}
                onWaiting={handleWaiting}
                loop
                autoPlay={autoplay}
                controls={showTimeControls}
              >
                <source src={value} />
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
          )}
          {type === RankItemType.Audio && (
            <AudioVisualizer
              width={clientBoundingRect?.width || '100%'}
              height={clientBoundingRect?.height || '100%'}
              src={value}
              ref={audioRef}
              hideControls={hideControls}
              autoplay={autoplay}
              buttonFontSize={fontSize}
              showTimeControls={showTimeControls}
              onCanPlay={handleReady}
              onWaiting={handleWaiting}
              onLoadStart={handleAudioInit}
              onPlay={onPlay}
              onPause={onPause}
            />
          )}
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
    },
  ),
);
