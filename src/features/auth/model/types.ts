export type RegisteredAccount = { id: string; email: string };

export type LoginChallenge = { challengeId: string };

export type SessionTokens = { accessToken: string; refreshToken: string; expiresInSeconds: number };
