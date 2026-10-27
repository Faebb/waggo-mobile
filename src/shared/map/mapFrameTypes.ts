import type { RefObject } from 'react';

/** What the map container exposes to `WaggoMap`: a way to send a command (already encoded) to the page. */
export type MapFrameHandle = { post: (message: string) => void };

/** Props of the platform container (`MapFrame.native.tsx` → WebView, `MapFrame.web.tsx` → iframe). */
export type MapFrameProps = {
  html: string;
  /** Name of the frame for assistive tech. */
  title: string;
  /** Raw message from the page; `WaggoMap` validates it. */
  onMessage: (raw: string) => void;
  /** The container itself failed to load the page (native only). */
  onLoadError: () => void;
  handleRef: RefObject<MapFrameHandle | null>;
};
