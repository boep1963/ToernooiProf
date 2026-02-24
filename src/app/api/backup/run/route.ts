import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/backup';

/**
 * POST /api/backup/run
 *
 * Creates a full Firestore backup to Cloud Storage.
 * Requires BACKUP_CRON_SECRET in Authorization header for security.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.BACKUP_CRON_SECRET;

    if (!expectedSecret) {
      console.error('[Backup API] BACKUP_CRON_SECRET environment variable not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Backup service not configured',
        },
        { status: 500 }
      );
    }

    // Check if authorization header matches the secret
    const providedSecret = authHeader?.replace('Bearer ', '');
    if (providedSecret !== expectedSecret) {
      console.warn('[Backup API] Unauthorized backup attempt');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Execute backup
    console.log('[Backup API] Starting backup...');
    const result = await createBackup();

    if (result.success) {
      console.log('[Backup API] Backup completed successfully');
      return NextResponse.json({
        success: true,
        backupName: result.backupName,
        metadata: result.metadata,
      });
    } else {
      console.error('[Backup API] Backup failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          backupName: result.backupName,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Backup API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
