import { Platform } from 'react-native';

import { fontFamily } from './theme';

describe('theme', () => {
  it('uses Helvetica as the typeface', () => {
    const expected = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica' });

    expect(fontFamily).toBe(expected);
    expect(fontFamily).toMatch(/Helvetica|sans-serif/);
  });
});
