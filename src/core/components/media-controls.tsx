import { memo } from 'react';

export const MediaControls = memo(() => {
  return (
    <media-control-bar>
      <media-play-button></media-play-button>
      <media-time-display showduration></media-time-display>
      <media-time-range></media-time-range>
      <media-playback-rate-button></media-playback-rate-button>
      <media-mute-button></media-mute-button>
      <media-volume-range></media-volume-range>
    </media-control-bar>
  );
});
