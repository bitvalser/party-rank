import { AudioHTMLAttributes, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import musicBgImage from '@assets/images/music-bg.jpg';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton } from '@mui/material';

interface AudioVisualizerProps extends AudioHTMLAttributes<HTMLAudioElement> {
  width?: string | number;
  height?: string | number;
  buttonFontSize?: string;
  autoplay?: boolean;
  hideControls?: boolean;
  showTimeControls?: boolean;
}

export const AudioVisualizer = forwardRef<HTMLAudioElement, AudioVisualizerProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const audioRef = useRef<HTMLAudioElement>();
  const containerRef = useRef<HTMLDivElement>();
  const animationFrameRef = useRef<number>();
  const [paused, setPaused] = useState(true);
  const audioContextRef = useRef<AudioContext>();
  const canPlay = useMemo(() => new AudioContext().state === 'running', []);
  const { width, height, buttonFontSize = '4em', hideControls, autoplay = true, showTimeControls, ...rest } = props;

  useImperativeHandle(ref, () => audioRef.current, []);

  const handlePause = () => {
    setPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleButtonPlay = () => {
    if (audioRef.current.readyState > 1) {
      audioRef.current.play();
    }
  };

  const handleButtonPause = () => {
    if (audioRef.current.readyState > 1) {
      audioRef.current.pause();
    }
  };

  const startVisualizer = () => {
    const canvas = canvasRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    audioContextRef.current = new AudioContext();

    const audioSource = audioContextRef.current.createMediaElementSource(audioRef.current);
    const analyser = audioContextRef.current.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContextRef.current.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 15;
    let barHeight: number;
    let x: number;

    function animate() {
      x = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyser.getByteFrequencyData(dataArray);
      drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    animate();

    function drawVisualizer(
      bufferLength: number,
      x: number,
      barWidth: number,
      barHeight: number,
      dataArray: Uint8Array,
    ) {
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5;
        ctx.save();
        let x = Math.sin((i * Math.PI) / 180) + 100;
        let y = Math.cos((i * Math.PI) / 180) + 100;
        ctx.translate(canvas.width / 2 + x, canvas.height / 2);
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
        ctx.lineWidth = barHeight / 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - barHeight);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        // circle
        ctx.beginPath();
        ctx.arc(0, y + barHeight, barHeight / 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'hsl(1, 100%, ' + i / 3 + '%)';
        ctx.stroke();

        ctx.restore();
        x += barWidth;
      }
    }
  };

  const handlePlay = () => {
    audioRef.current.volume = 1;
    setPaused(false);
    // startVisualizer();
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: width || '100%',
        height: height || '100%',
        position: 'relative',
        backgroundImage: `url(${musicBgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      <audio
        {...rest}
        style={{
          position: 'absolute',
          bottom: 0,
          zIndex: 9,
          left: 0,
          width: '100%',
        }}
        ref={audioRef}
        autoPlay={canPlay && autoplay}
        loop
        onPlay={handlePlay}
        onPause={handlePause}
        controls={showTimeControls}
        hidden={!showTimeControls}
      />
      {/* <canvas width="100%" height="100%" ref={canvasRef} /> */}
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
                transition: (theme) =>
                  theme.transitions.create('opacity', {
                    duration: theme.transitions.duration.shortest,
                  }),
                '&:hover': {
                  opacity: 0.9,
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
