import { NextResponse } from 'next/server';
import { db, initializeCollections } from '@/lib/db';

export async function GET() {
  try {
    // Check database connectivity
    console.log('[HEALTH] Checking database connectivity...');
    const healthResult = await db.healthCheck();

    // Ensure all collections are initialized
    const initialized = await initializeCollections();

    // List all available collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);

    console.log(`[HEALTH] Database: ${healthResult.type} (${healthResult.status}), Collections: ${collectionNames.length}`);

    return NextResponse.json({
      status: 'ok',
      database: healthResult.status,
      databaseType: healthResult.type,
      collections: collectionNames,
      isFirestore: db.isFirestore,
      newlyInitialized: initialized.length > 0 ? initialized : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[HEALTH] Health check failed:', error);
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
