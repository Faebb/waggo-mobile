// Jest mock of react-native-webview (automatic for node_modules mocks next to node_modules): a plain View that
// keeps the props (tests fire `onMessage` on it) and records every script injected with `injectJavaScript`.
import { forwardRef, useImperativeHandle } from 'react';
import { View, type ViewProps } from 'react-native';

export const injectedScripts: string[] = [];

type Handle = { injectJavaScript: (script: string) => void };
type Props = ViewProps & { onMessage?: (event: { nativeEvent: { data: string } }) => void; source?: unknown };

export const WebView = forwardRef<Handle, Props>(function WebView(props, ref) {
  useImperativeHandle(ref, () => ({ injectJavaScript: (script: string) => void injectedScripts.push(script) }), []);
  return <View {...props} />;
});
