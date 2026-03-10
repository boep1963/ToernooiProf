/**
 * BasePath afleiden uit de huidige URL (zelfde logica als api.ts).
 */
function getBasePath(): string {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_BASE_PATH || '';
  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  return '/' + parts[0];
}

/** Navigeer via window.location met basePath prefix */
export function navigateTo(path: string) {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  window.location.href = `${basePath}${normalizedPath}`;
}

