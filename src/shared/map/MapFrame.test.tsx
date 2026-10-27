import { createRef } from 'react';
import { Linking } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import { MapFrame as NativeMapFrame } from './MapFrame.native';
import { MapFrame as WebMapFrame } from './MapFrame.web';
import type { MapFrameHandle } from './mapFrameTypes';

describe('MapFrame.native (WebView)', () => {
  it('keeps the map page inside and opens any other link (OSM copyright) in the browser', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render(
      <NativeMapFrame
        html="<p>map</p>"
        title="Mapa"
        onMessage={jest.fn()}
        onLoadError={jest.fn()}
        handleRef={createRef()}
      />,
    );
    const allow = screen.getByTestId('waggo-map-webview').props.onShouldStartLoadWithRequest as (request: {
      url: string;
    }) => boolean;

    expect(allow({ url: 'https://waggo.app/' })).toBe(true);
    expect(allow({ url: 'about:blank' })).toBe(true);
    expect(allow({ url: 'https://www.openstreetmap.org/copyright' })).toBe(false);
    expect(openURL).toHaveBeenCalledWith('https://www.openstreetmap.org/copyright');
  });

  it('identifies the app in the User-Agent and hands page messages over', async () => {
    const onMessage = jest.fn();
    await render(
      <NativeMapFrame
        html="<p>map</p>"
        title="Mapa"
        onMessage={onMessage}
        onLoadError={jest.fn()}
        handleRef={createRef()}
      />,
    );
    const frame = screen.getByTestId('waggo-map-webview');

    frame.props.onMessage({ nativeEvent: { data: '{"type":"ready"}' } });

    expect(frame.props.applicationNameForUserAgent).toBe('Waggo/1.0 (+https://waggo.app)');
    expect(onMessage).toHaveBeenCalledWith('{"type":"ready"}');
  });
});

describe('MapFrame.web (iframe)', () => {
  // The React Native test environment has no DOM events: the window listeners are captured by hand.
  let listeners: ((event: { source: unknown; data: unknown }) => void)[] = [];

  beforeEach(() => {
    listeners = [];
    window.addEventListener = jest.fn((_type: string, listener: (typeof listeners)[number]) =>
      listeners.push(listener),
    ) as never;
    window.removeEventListener = jest.fn() as never;
  });

  it('renders the same page in a sandboxed iframe', async () => {
    await render(
      <WebMapFrame
        html="<p>map</p>"
        title="Mapa"
        onMessage={jest.fn()}
        onLoadError={jest.fn()}
        handleRef={createRef()}
      />,
    );

    const iframe = screen.toJSON() as { type: string; props: Record<string, unknown> };
    expect(iframe.type).toBe('iframe');
    expect(iframe.props.srcDoc).toBe('<p>map</p>');
    expect(iframe.props.sandbox).toBe('allow-scripts allow-popups allow-popups-to-escape-sandbox');
    expect(iframe.props.title).toBe('Mapa');
  });

  it('only listens to its own frame and exposes a post handle', async () => {
    const onMessage = jest.fn();
    const handleRef = createRef<MapFrameHandle>();
    await render(
      <WebMapFrame
        html="<p>map</p>"
        title="Mapa"
        onMessage={onMessage}
        onLoadError={jest.fn()}
        handleRef={handleRef}
      />,
    );

    await act(async () => {
      listeners.forEach((listen) => listen({ source: {}, data: '{"type":"ready"}' }));
    });

    expect(listeners).toHaveLength(1);
    expect(onMessage).not.toHaveBeenCalled();
    expect(() => handleRef.current?.post('{}')).not.toThrow();
  });
});
