/**
 * Patch global fetch to auto-prefix basePath for /api/ calls.
 * Import this once in the root layout.
 */
const BASE_PATH = '/toernooiprof';

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = BASE_PATH + input;
    }
    return originalFetch(input, init);
  };
}
