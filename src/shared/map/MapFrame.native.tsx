import { useImperativeHandle, useRef } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { APP_BASE_URL, APP_USER_AGENT } from './mapConfig';
import type { MapFrameProps } from './mapFrameTypes';

const styles = StyleSheet.create({ webView: { flex: 1, backgroundColor: 'transparent' } });

/** Only the map page itself loads inside the WebView; any link (the OSM copyright) opens in the browser. */
function allowLoad(request: WebViewNavigation): boolean {
  if (request.url.startsWith(APP_BASE_URL) || request.url.startsWith('about:') || request.url.startsWith('data:')) {
    return true;
  }
  void Linking.openURL(request.url);
  return false;
}

/**
 * iOS/Android container of the map page: `react-native-webview` (bundled in Expo Go, no development build). The
 * page is loaded with the app's base URL, so OSM sees an identifiable Referer, and the User-Agent ends with "Waggo".
 */
// `title` names the web iframe; here the wrapper in WaggoMap already carries the map summary.
export function MapFrame({ html, onMessage, onLoadError, handleRef }: MapFrameProps) {
  const webView = useRef<WebView>(null);

  useImperativeHandle(
    handleRef,
    () => ({
      post: (message: string) =>
        webView.current?.injectJavaScript(
          `window.waggoReceive && window.waggoReceive(${JSON.stringify(message)}); true;`,
        ),
    }),
    [],
  );

  return (
    <WebView
      ref={webView}
      testID="waggo-map-webview"
      source={{ html, baseUrl: APP_BASE_URL }}
      originWhitelist={['*']}
      onMessage={(event: WebViewMessageEvent) => onMessage(event.nativeEvent.data)}
      onError={onLoadError}
      onShouldStartLoadWithRequest={allowLoad}
      applicationNameForUserAgent={APP_USER_AGENT}
      setSupportMultipleWindows={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      nestedScrollEnabled
      style={styles.webView}
    />
  );
}
