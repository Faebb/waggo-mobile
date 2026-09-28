/** Error raised by the HTTP client. `code` mirrors the backend ProblemDetails `code` (e.g. "Pricing.InvalidDuration"). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
