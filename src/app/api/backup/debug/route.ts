import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import { diagnoseBackupAccess } from '@/lib/backup';

/**
 * GET /api/backup/debug
 *
 * Diagnose Cloud Storage toegang voor backups.
 * Alleen beschikbaar voor super admins.
 */
export async function GET(request: NextRequest) {
  try {
    const validation = await validateSuperAdmin(request);
    if (validation instanceof NextResponse) {
      return validation;
    }

    const diagnostics = await diagnoseBackupAccess();

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
