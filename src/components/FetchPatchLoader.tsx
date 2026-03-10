'use client';

import '@/lib/patchFetch';

/**
 * Loader component that applies the fetch patch (basePath for /api/ calls).
 * Renders nothing; the import runs the patch once when the client bundle loads.
 */
export default function FetchPatchLoader() {
  return null;
}
