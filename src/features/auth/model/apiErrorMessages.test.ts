import { ApiError } from '@/shared/api/ApiError';

import { apiErrorMessages } from './apiErrorMessages';

describe('apiErrorMessages', () => {
  it('returns the messages of an ApiError', () => {
    const error = new ApiError(400, [
      { code: 'A.1', message: 'Uno' },
      { code: 'A.2', message: 'Dos' },
    ]);

    expect(apiErrorMessages(error, true)).toEqual(['Uno', 'Dos']);
  });

  it('returns the fallback for an ApiError without errors', () => {
    expect(apiErrorMessages(new ApiError(500, []), true)).toEqual(['Algo salió mal. Intenta de nuevo.']);
  });

  it('returns the fallback for an unknown error and nothing when there is no error', () => {
    expect(apiErrorMessages(new Error('x'), true, 'Falló')).toEqual(['Falló']);
    expect(apiErrorMessages(null, false)).toEqual([]);
  });
});
