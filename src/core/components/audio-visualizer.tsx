import {
  AudioHTMLAttributes,
  ReactEventHandler,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import musicBgImage from '@assets/images/music-bg.jpg';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton } from '@mui/material';

import { useInjectable } from '../hooks/useInjectable';
import useSubscription from '../hooks/useSubscription';
import { AppTypes } from '../services/types';
import { MediaControls } from './media-controls';
import { RankPartyPlayerRef } from './rank-party-player';

interface AudioVisualizerProps extends AudioHTMLAttributes<HTMLAudioElement> {
  width?: string | number;
  height?: string | number;
  startTime?: number;
  buttonFontSize?: string;
  autoplay?: boolean;
  hideControls?: boolean;
  showTimeControls?: boolean;
  onManualPause?: () => void;
  onManualPlay?: () => void;
}

export const AudioVisualizer = forwardRef<RankPartyPlayerRef, AudioVisualizerProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const audioRef = useRef<HTMLAudioElement>();
  const containerRef = useRef<HTMLDivElement>();
  const animationFrameRef = useRef<number>();
  const [paused, setPaused] = useState(true);
  const [enableVisualizer, setEnableVisualizer] = useState(false);
  const audioContextRef = useRef<AudioContext>();
  const canPlay = useMemo(() => new AudioContext().state === 'running', []);
  const { defaultVolume$ } = useInjectable(AppTypes.SettingsService);
  const defaultVolume = useSubscription(defaultVolume$, 1);
  const {
    width,
    height,
    buttonFontSize = '4em',
    hideControls,
    startTime = 0,
    autoplay = true,
    showTimeControls,
    onPlay = () => {},
    onManualPlay = () => {},
    onManualPause = () => {},
    ...rest
  } = props;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = defaultVolume;
    }
  }, [defaultVolume]);

  useEffect(
    () => () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      play: async () => {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error(error);
        }
      },
      pause: () => {
        audioRef.current.pause();
      },
      setVolume: (value: number) => {
        audioRef.current.volume = value;
      },
      getCurrentTimestamp: () => {
        return Promise.resolve(audioRef.current.currentTime);
      },
      playWithTimestamp: (time: number) => {
        audioRef.current.currentTime = time;
      },
    }),
    [],
  );

  const handlePause = () => {
    setPaused(true);
  };

  const handleButtonPlay = () => {
    if (audioRef.current.readyState > 1) {
      audioRef.current.play();
    }
    onManualPlay();
  };

  const handleButtonPause = () => {
    if (audioRef.current.readyState > 1) {
      audioRef.current.pause();
    }
    onManualPause();
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    audioContextRef.current = new AudioContext({});

    const audioSource = audioContextRef.current.createMediaElementSource(audioRef.current);
    const analyser = audioContextRef.current.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContextRef.current.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight: number;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);
      drawVisualizer(bufferLength, barWidth, barHeight, dataArray);
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    animate();

    function drawVisualizer(bufferLength: number, barWidth: number, barHeight: number, dataArray: Uint8Array) {
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5;
        ctx.save();
        const radius = Math.min(canvas.width / 10, 100);
        let x = Math.sin((i * Math.PI) / 180) + radius;
        let y = Math.cos((i * Math.PI) / 180) + radius;
        ctx.translate(canvas.width / 2 + x - radius, canvas.height / 2);
        ctx.rotate(i + (Math.PI * 2) / bufferLength);

        const hue = i * 0.6 + 200;
        ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
        ctx.strokeStyle = 'hsl(' + hue + ',100%, 50%)';

        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,1)';

        ctx.globalCompositeOperation = 'source-over';

        // line
        ctx.lineWidth = barHeight / 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - barHeight);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        // circle
        ctx.beginPath();
        ctx.arc(0, y + barHeight, barHeight / 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'hsl(1, 100%, ' + i / 3 + '%)';
        ctx.stroke();

        ctx.restore();
        x += barWidth;
      }
    }
  };

  const handleAudioInit: ReactEventHandler<HTMLAudioElement> = (event) => {
    (event.target as HTMLAudioElement).currentTime = startTime;
    (event.target as HTMLAudioElement).volume = defaultVolume;
  };

  const handlePlay = (event: any) => {
    setPaused(false);
    onPlay(event);
    if (enableVisualizer && !audioContextRef.current) {
      startVisualizer();
    }
  };

  const handleVolumeChange = useDebouncedCallback((value: number) => {
    if (typeof value === 'number') {
      defaultVolume$.next(value);
    }
  }, 500);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: width || '100%',
        height: height || '100%',
        position: 'relative',
        backgroundImage: enableVisualizer ? 'initial' : `url(${musicBgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      <media-controller class="audio-container">
        <audio
          {...rest}
          key={`visualizer_${enableVisualizer}`}
          slot="media"
          style={{
            position: 'absolute',
            bottom: 0,
            zIndex: 9,
            left: 0,
            width: '100%',
          }}
          ref={audioRef}
          autoPlay={canPlay && autoplay}
          crossOrigin={enableVisualizer ? 'anonymous' : null}
          loop
          onVolumeChange={(event) => handleVolumeChange((event.target as HTMLVideoElement)?.volume)}
          onLoadStart={handleAudioInit}
          onPlay={handlePlay}
          onError={() => setEnableVisualizer(false)}
          onPause={handlePause}
          hidden={!showTimeControls}
        />
        {showTimeControls && <MediaControls />}
      </media-controller>
      {enableVisualizer && <canvas width="100%" height="100%" ref={canvasRef} />}
      {!hideControls && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            position: 'absolute',
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
                fontSize: buttonFontSize,
                background: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9,
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
                fontSize: buttonFontSize,
                background: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9,
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
      )}
    </Box>
  );
});
