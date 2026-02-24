import { NextRequest, NextResponse } from 'next/server';
import { listBackups } from '@/lib/backup';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/backup/list
 *
 * Lists all available backups from Cloud Storage.
 * Requires authenticated session (organization admin).
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - please login',
        },
        { status: 401 }
      );
    }

    console.log('[Backup API] Listing backups for user:', session.orgNummer);

    // List all backups
    const backups = await listBackups();

    console.log(`[Backup API] Found ${backups.length} backups`);

    return NextResponse.json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (error) {
    console.error('[Backup API] Failed to list backups:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
