import { ReactEventHandler, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Box, LinearProgress } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { RankItemType } from '../interfaces/rank-item.interface';
import { AppTypes } from '../services/types';
import { AudioVisualizer } from './audio-visualizer';
import { VideoPlayer } from './video-player';
import { YoutubePlayer } from './youtube-player';

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
  setVolume: (value: number) => void;
  getCurrentTimestamp: () => Promise<number>;
  playWithTimestamp: (time: number) => void;
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
      const videoRef = useRef<RankPartyPlayerRef>(null);
      const audioRef = useRef<RankPartyPlayerRef>(null);
      const youtubeRef = useRef<RankPartyPlayerRef>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const playerRef = useRef<RankPartyPlayerRef>(null);
      const [clientBoundingRect, setClientBoundingRect] = useState<DOMRect>();
      playerRef.current = ((): RankPartyPlayerRef => {
        switch (type) {
          case RankItemType.Audio:
            return audioRef.current;
          case RankItemType.Video:
            return videoRef.current;
          case RankItemType.YouTube:
            return youtubeRef.current;
          default:
            return {
              play: () => {
                console.error("RankPartyPlayerRef interface wasn't implemented");
              },
              pause: () => {
                console.error("RankPartyPlayerRef interface wasn't implemented");
              },
              setVolume: () => {
                console.error("RankPartyPlayerRef interface wasn't implemented");
              },
              getCurrentTimestamp: () => {
                console.error("RankPartyPlayerRef interface wasn't implemented");
                return null;
              },
              playWithTimestamp: () => {
                console.error("RankPartyPlayerRef interface wasn't implemented");
              },
            };
        }
      })();

      useEffect(() => {
        setClientBoundingRect(containerRef.current.getBoundingClientRect());
      }, []);

      useEffect(() => {
        if (playerRef.current) {
          playerRef.current.setVolume(defaultVolume);
        }
      }, [defaultVolume]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      useImperativeHandle(componentRef, () => playerRef.current, [type]);

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
