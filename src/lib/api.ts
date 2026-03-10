/**
 * BasePath afleiden uit de huidige URL (werkt in dev en productie zonder env).
 * Bij basePath '/toernooiprof' is pathname bv. /toernooiprof/inloggen → return '/toernooiprof'.
 */
function getBasePath(): string {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_BASE_PATH || '';
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  return '/' + parts[0];
}

export function apiFetch(input: string, init?: RequestInit) {
  if (/^https?:\/\//i.test(input)) return fetch(input, init);

  const base = getBasePath();
  const path = input.startsWith('/') ? input : `/${input}`;
  if (base && path.startsWith(base)) return fetch(path, init);

  const url = base ? `${base}${path}` : path;
  return fetch(url, init);
}


