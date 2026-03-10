/**
 * Patch global fetch to auto-prefix basePath for /api/ calls.
 * Import once via FetchPatchLoader in root layout.
 * BasePath wordt afgeleid uit window.location.pathname (eerste segment).
 */
function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  return '/' + parts[0];
}

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const base = getBasePath();
      if (base && !input.startsWith(base)) {
        input = base + input;
      }
    }
    return originalFetch(input, init);
  };
}
