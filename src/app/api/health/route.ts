import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import admin SDK lazily to avoid initialization issues
    const { adminDb } = await import('@/lib/firebase-admin');

    // Test Firestore connectivity
    const testRef = adminDb.collection('_health_check');
    await testRef.limit(1).get();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
