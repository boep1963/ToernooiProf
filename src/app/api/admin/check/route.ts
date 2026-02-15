import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';

/**
 * GET /api/admin/check
 * Returns whether the currently logged-in user is a super admin.
 * Used for client-side verification and testing.
 */
export async function GET(request: NextRequest) {
  const result = await validateSuperAdmin(request);

  // If result is a NextResponse, it means validation failed (401/403/404)
  if (result instanceof NextResponse) {
    // Return a non-error response with isSuperAdmin: false for the check endpoint
    return NextResponse.json({ isSuperAdmin: false });
  }

  return NextResponse.json({
    isSuperAdmin: true,
    orgNummer: result.orgNummer,
  });
}
