import { NextRequest, NextResponse } from 'next/server';
import { listBackups } from '@/lib/backup';
import { validateSuperAdmin } from '@/lib/admin';

/**
 * GET /api/backup/list
 *
 * Lists all available backups from Cloud Storage.
 * Requires super admin access.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is a super admin
    const validation = await validateSuperAdmin(request);
    if (validation instanceof NextResponse) {
      return validation; // Return 401/403 error response
    }

    const { orgNummer } = validation;
    console.log('[Backup API] Listing backups for super admin:', orgNummer);

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
