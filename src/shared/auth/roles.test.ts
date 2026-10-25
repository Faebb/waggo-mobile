import { decodeRoles } from './roles';

function makeToken(payload: unknown): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('decodeRoles (ADR-011/ADR-016 roles claim)', () => {
  it('reads the roles claim of a real access token', () => {
    expect(decodeRoles(makeToken({ sub: 'user-1', roles: ['owner', 'admin'] }))).toEqual(['owner', 'admin']);
  });

  it('returns an empty list when the token has no roles claim', () => {
    expect(decodeRoles(makeToken({ sub: 'user-1' }))).toEqual([]);
  });

  it('returns an empty list for a malformed token instead of throwing', () => {
    expect(decodeRoles('not-a-jwt')).toEqual([]);
  });
});
