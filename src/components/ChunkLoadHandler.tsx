'use client';

import { useEffect } from 'react';

const CHUNK_RELOAD_KEY = 'chunk-reload';

function isChunkLoadError(error: Error): boolean {
  const msg = error?.message ?? '';
  const name = error?.name ?? '';
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Loading CSS chunk \d+ failed/i.test(msg)
  );
}

export default function ChunkLoadHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event?.error;
      if (!error || !isChunkLoadError(error)) return;

      if (typeof sessionStorage === 'undefined') return;
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') return;

      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
      window.location.reload();
    };

    window.addEventListener('error', handleError);

    const clearFlag = () => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        // ignore
      }
    };

    const t = window.setTimeout(clearFlag, 5000);

    return () => {
      window.removeEventListener('error', handleError);
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
