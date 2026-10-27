import { act, screen } from '@testing-library/react-native';
import * as webView from 'react-native-webview';

import type { MapCommand, MapEvent } from '@/shared/map/protocol';

/** Scripts recorded by the react-native-webview mock (`__mocks__/react-native-webview.tsx`). */
function injected(): string[] {
  return (webView as unknown as { injectedScripts: string[] }).injectedScripts;
}

/** Forgets the commands sent so far (call it in `beforeEach`). */
export function clearMapCommands() {
  injected().length = 0;
}

/** Commands the app sent to the map page, oldest first. */
export function sentMapCommands(): MapCommand[] {
  return injected().map((script) => {
    const payload = /waggoReceive\((".*")\); true;$/s.exec(script)?.[1] ?? '""';
    return JSON.parse(JSON.parse(payload) as string) as MapCommand;
  });
}

/** Simulates the map page sending an event (e.g. the user dragged the map). `index` picks one of several maps. */
export async function emitMapEvent(event: MapEvent, index = 0) {
  const frame = screen.getAllByTestId('waggo-map-webview', { includeHiddenElements: true })[index];
  await act(async () => {
    frame?.props.onMessage({ nativeEvent: { data: JSON.stringify(event) } });
  });
}
