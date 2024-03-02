import { ReactEventHandler, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Box, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { RankItemType } from '../interfaces/rank-item.interface';
import { AppTypes } from '../services/types';
import { AudioVisualizer } from './audio-visualizer';
import { VideoPlayer, VideoPlayerRef } from './video-player';
import { YoutubePlayer, YoutubePlayerRef } from './youtube-player';

export interface RankPartyPlayer {
  type: RankItemType;
  value: string;
  autoplay?: boolean;
  startTime?: number;
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
  getCurrentTimestamp: () => Promise<number>;
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
        startTime = 0,
        onPause = () => {},
        onManualPause = () => {},
        onManualPlay = () => {},
        onPlay = () => {},
      }: RankPartyPlayer,
      componentRef,
    ) => {
      const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
      const [waiting, setWaiting] = useState([RankItemType.Audio, RankItemType.Video].includes(type));
      const defaultVolume = useSubscription(defaultVolume$, 1);
      const videoRef = useRef<VideoPlayerRef>(null);
      const audioRef = useRef<HTMLAudioElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const youtubeRef = useRef<YoutubePlayerRef>(null);
      const [clientBoundingRect, setClientBoundingRect] = useState<DOMRect>();

      useEffect(() => {
        setClientBoundingRect(containerRef.current.getBoundingClientRect());
      }, []);

      useEffect(() => {
        if (videoRef.current) {
          videoRef.current.setVolume(defaultVolume);
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
                  youtubeRef.current.play();
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
                youtubeRef.current.pause();
                break;
            }
          },
          getCurrentTimestamp: async () => {
            try {
              switch (type) {
                case RankItemType.Audio:
                  return audioRef.current.currentTime;
                case RankItemType.Video:
                  return videoRef.current.getCurrentTime();
                case RankItemType.YouTube:
                  return await youtubeRef.current.getCurrentTime();
              }
            } catch (error) {
              console.error(error);
            }
            return null;
          },
        }),
        [type],
      );

      const handlePause = () => {
        onPause();
      };

      const handlePlay = () => {
        setWaiting(false);
        onPlay();
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
            <YoutubePlayer
              link={value}
              startTime={startTime}
              ref={youtubeRef}
              width={clientBoundingRect?.width || '100%'}
              height={clientBoundingRect?.height || '100%'}
              onPlay={handlePlay}
              onPause={handlePause}
              onManualPause={onManualPause}
              onManualPlay={onManualPlay}
              loop
              autoplay={autoplay}
              showTimeControls={showTimeControls}
            />
          )}
          {type === RankItemType.Video && (
            <VideoPlayer
              src={value}
              startTime={startTime}
              fontSize={fontSize}
              onCanPlay={handleReady}
              ref={videoRef}
              width="100%"
              onLoadStart={handleVideoInit}
              onVolumeChange={(event) => handleVolumeChange((event.target as HTMLVideoElement)?.volume)}
              height="100%"
              onPlay={handlePlay}
              onPause={handlePause}
              onManualPause={onManualPause}
              onManualPlay={onManualPlay}
              onWaiting={handleWaiting}
              loop
              autoplay={autoplay}
              showTimeControls={showTimeControls}
            />
          )}
          {type === RankItemType.Audio && (
            <AudioVisualizer
              width={clientBoundingRect?.width || '100%'}
              height={clientBoundingRect?.height || '100%'}
              startTime={startTime}
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
