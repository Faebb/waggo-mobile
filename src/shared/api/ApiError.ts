import type { WaggoApiMessage } from './waggoApiResponse';

/**
 * Raised when waggo-api answers `success: false` (or not with a valid envelope).
 * `code` is the first error code (e.g. "Pricing.InvalidDuration"); `errors` has all of them.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errors: WaggoApiMessage[],
    public readonly traceId: string | null = null,
  ) {
    super(errors[0]?.message ?? `HTTP ${status}`);
    this.name = 'ApiError';
  }

  get code(): string | undefined {
    return this.errors[0]?.code;
  }
}
