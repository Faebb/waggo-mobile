import type { ReactNode } from 'react';
import { View as mockView } from 'react-native';

// react-native-keyboard-controller needs its native module, which Jest does not have. Screens only need the components
// to render, so the module is replaced by plain Views.
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({ children }: { children: ReactNode }) => children,
  KeyboardAvoidingView: mockView,
}));
