import { readdirSync, readFileSync } from 'fs';
import { join, relative, sep } from 'path';

const srcDir = join(__dirname, '..', '..');
const WELCOME_SCREEN = ['features', 'onboarding', 'screens', 'WelcomeScreen.tsx'].join('/');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe('typography usage (UX-001)', () => {
  it('uses the display style only in the welcome screen headline', () => {
    const users = sourceFiles(srcDir)
      .filter((file) => readFileSync(file, 'utf8').includes('typography.display'))
      .map((file) => relative(srcDir, file).split(sep).join('/'));

    expect(users).toEqual([WELCOME_SCREEN]);
  });
});
