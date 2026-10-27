import { useEffect, useImperativeHandle, useRef } from 'react';

import type { MapFrameProps } from './mapFrameTypes';

const frameStyle = { border: 0, width: '100%', height: '100%', display: 'block' } as const;

/**
 * Web container of the map page: an `<iframe srcDoc>` with the same HTML as the WebView. Sandboxed (scripts only,
 * plus popups so the OSM copyright link opens in a new tab): the page cannot touch the app. Messages are accepted
 * only from this frame's window.
 */
export function MapFrame({ html, title, onMessage, handleRef }: MapFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(
    handleRef,
    () => ({ post: (message: string) => frame.current?.contentWindow?.postMessage(message, '*') }),
    [],
  );

  useEffect(() => {
    function listen(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || typeof event.data !== 'string') return;
      onMessage(event.data);
    }
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, [onMessage]);

  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={html}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin"
      style={frameStyle}
    />
  );
}
