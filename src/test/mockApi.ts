type Route = {
  method?: 'GET' | 'POST';
  /** Path of waggo-api without the host, e.g. "/api/v1/pets". A RegExp matches dynamic paths. */
  path: string | RegExp;
  data?: unknown;
  status?: number;
  errors?: { code: string; message: string }[];
};

/** A WaggoApiResponse envelope as waggo-api sends it. */
export function envelopeResponse(data: unknown, status = 200, errors: Route['errors'] = []) {
  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      data: errors.length === 0 ? data : null,
      pagination: null,
      errors,
      warnings: [],
      infos: [],
      traceId: 't',
    }),
    { status },
  );
}

/**
 * Fakes waggo-api by method and path. Returns the fetch spy, so tests can check the requests that were sent.
 * An unknown route answers 404, so a missing fake fails loudly.
 */
export function mockApi(routes: Route[]) {
  return jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    // React Native's URL polyfill lacks pathname/searchParams, so the path is cut by hand.
    const pathname =
      String(input)
        .replace(/^https?:\/\/[^/]+/, '')
        .split('?')[0] ?? '';
    const method = (init?.method ?? 'GET').toUpperCase();
    const route = routes.find(
      (candidate) =>
        (candidate.method ?? 'GET') === method &&
        (typeof candidate.path === 'string' ? candidate.path === pathname : candidate.path.test(pathname)),
    );
    if (!route) {
      return envelopeResponse(null, 404, [{ code: 'Http.NotFound', message: `No fake for ${method} ${pathname}` }]);
    }
    return envelopeResponse(route.data, route.status ?? (route.errors?.length ? 400 : 200), route.errors);
  });
}
