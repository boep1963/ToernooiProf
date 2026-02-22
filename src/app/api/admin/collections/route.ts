import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';

/**
 * GET /api/admin/collections
 * Lists all Firestore collections under the ClubMatch/data namespace with document counts.
 * Protected by super admin check.
 */
export async function GET(request: NextRequest) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    // List of all collections in the ClubMatch/data namespace
    const collectionNames = [
      'organizations',
      'members',
      'competitions',
      'competition_players',
      'matches',
      'results',
      'tables',
      'device_config',
      'scoreboards',
      'email_queue',
    ];

    // Get document count for each collection
    const collections = await Promise.all(
      collectionNames.map(async (name) => {
        try {
          const snapshot = await db.collection(name).get();
          return {
            name,
            count: snapshot.size,
          };
        } catch (error) {
          console.error(`[ADMIN] Error counting ${name}:`, error);
          return {
            name,
            count: 0,
            error: 'Fout bij ophalen aantal documenten',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      collections,
      total: collections.reduce((sum, col) => sum + col.count, 0),
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen collecties.' },
      { status: 500 }
    );
  }
}
