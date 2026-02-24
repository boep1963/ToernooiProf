import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/backup';
import { validateSuperAdmin } from '@/lib/admin';

/**
 * POST /api/backup/run
 *
 * Creates a full Firestore backup to Cloud Storage.
 * Requires either:
 * - BACKUP_CRON_SECRET in Authorization header (for automated cron jobs), OR
 * - Super admin session (for manual backup triggers)
 */
export async function POST(request: NextRequest) {
  try {
    // Two authorization paths: CRON secret OR super admin session
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.BACKUP_CRON_SECRET;

    let authorized = false;
    let authMethod = '';

    // Path 1: Check CRON secret (for automated backups)
    if (expectedSecret && authHeader) {
      const providedSecret = authHeader.replace('Bearer ', '');
      if (providedSecret === expectedSecret) {
        authorized = true;
        authMethod = 'cron-secret';
        console.log('[Backup API] Authorized via CRON secret');
      }
    }

    // Path 2: Check super admin session (for manual backups)
    if (!authorized) {
      const validation = await validateSuperAdmin(request);
      if (!(validation instanceof NextResponse)) {
        authorized = true;
        authMethod = 'super-admin';
        console.log(`[Backup API] Authorized as super admin (org ${validation.orgNummer})`);
      } else {
        // Not authorized via secret or super admin
        return validation; // Return 401/403 error response
      }
    }

    // Execute backup
    console.log(`[Backup API] Starting backup (auth: ${authMethod})...`);
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
