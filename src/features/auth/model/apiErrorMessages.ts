import { ApiError } from '@/shared/api/ApiError';

/** Same shape every screen of this feature shows: the API's own messages, or a generic fallback. */
export function apiErrorMessages(error: unknown, isError: boolean, fallback = 'Algo salió mal. Intenta de nuevo.') {
  if (error instanceof ApiError && error.errors.length > 0) return error.errors.map((e) => e.message);
  if (error instanceof ApiError) return [fallback];
  return isError ? [fallback] : [];
}
