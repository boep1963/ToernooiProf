import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

export async function GET() {
  try {
    await db.healthCheck();
    return cachedJsonResponse({ status: 'ok' }, 'no-cache');
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
