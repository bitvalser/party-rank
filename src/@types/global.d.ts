import { DOMAttributes } from "react";

type CustomElement<T = HTMLElement> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global{
  namespace JSX {
    interface IntrinsicElements {
      "media-control-bar": JSX.HTMLAttributes<CustomElement>;
      "media-play-button": JSX.HTMLAttributes<CustomElement>;
      "media-mute-button": JSX.HTMLAttributes<CustomElement>;
      "media-volume-range": JSX.HTMLAttributes<CustomElement>;
      "media-time-range": JSX.HTMLAttributes<CustomElement>;
      "media-pip-button": JSX.HTMLAttributes<CustomElement>;
      "media-fullscreen-button": JSX.HTMLAttributes<CustomElement>;
      "media-controller": JSX.HTMLAttributes<CustomElement>;
      "media-time-display": JSX.HTMLAttributes<CustomElement>;
      "media-playback-rate-button": JSX.HTMLAttributes<CustomElement>;
      "youtube-video": JSX.HTMLAttributes<CustomElement>;
      "media-loading-indicator": JSX.HTMLAttributes<CustomElement>;
    }
  }
}