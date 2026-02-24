import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup, createBackup } from '@/lib/backup';

/**
 * POST /api/backup/restore
 *
 * Restores Firestore data from a Cloud Storage backup.
 * Requires authenticated session (organization admin).
 * Automatically creates a pre-restore backup as safety measure.
 *
 * Request body:
 * {
 *   "backupName": "backup-2026-02-24T03:00:00.000Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const sessionCookie = request.cookies.get('clubmatch-session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - please login',
        },
        { status: 401 }
      );
    }

    let session: { orgNummer?: number };
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session',
        },
        { status: 401 }
      );
    }

    if (!session.orgNummer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - please login',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { backupName } = body;

    if (!backupName || typeof backupName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request - backupName is required',
        },
        { status: 400 }
      );
    }

    console.log(`[Backup API] Restore requested by user ${session.orgNummer} for backup: ${backupName}`);

    // Create a pre-restore backup as safety measure
    console.log('[Backup API] Creating pre-restore backup...');
    const preRestoreResult = await createBackup();

    if (!preRestoreResult.success) {
      console.error('[Backup API] Pre-restore backup failed:', preRestoreResult.error);
      return NextResponse.json(
        {
          success: false,
          error: `Pre-restore backup failed: ${preRestoreResult.error}`,
          phase: 'pre-restore-backup',
        },
        { status: 500 }
      );
    }

    console.log('[Backup API] Pre-restore backup created:', preRestoreResult.backupName);

    // Perform the restore
    console.log('[Backup API] Starting restore...');
    const restoreResult = await restoreBackup(backupName);

    if (restoreResult.success) {
      console.log('[Backup API] Restore completed successfully');
      return NextResponse.json({
        success: true,
        preRestoreBackup: preRestoreResult.backupName,
        collectionsRestored: restoreResult.collectionsRestored,
        documentsRestored: restoreResult.documentsRestored,
      });
    } else {
      console.error('[Backup API] Restore failed:', restoreResult.error);
      return NextResponse.json(
        {
          success: false,
          error: restoreResult.error,
          preRestoreBackup: preRestoreResult.backupName,
          phase: 'restore',
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
        phase: 'unknown',
      },
      { status: 500 }
    );
  }
}
