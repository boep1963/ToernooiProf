import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

const HEALTH_CACHE_MS = 60 * 60 * 1000; // 1 uur
let healthCache: { data: { status: 'ok'; organizations: number }; expires: number } | null = null;

export async function GET() {
  const now = Date.now();
  if (healthCache && healthCache.expires > now) {
    return cachedJsonResponse(healthCache.data, 'no-cache');
  }

  try {
    await db.healthCheck();
    const orgSnapshot = await db.collection('organizations').get();
    const data = { status: 'ok' as const, organizations: orgSnapshot.size };
    healthCache = { data, expires: now + HEALTH_CACHE_MS };
    return cachedJsonResponse(data, 'no-cache');
  } catch (error) {
    console.error('[HEALTH] Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
