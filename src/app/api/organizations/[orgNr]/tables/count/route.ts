import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { normalizeOrgNummer, logQueryResult } from '@/lib/orgNumberUtils';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/tables/count
 * Get total count of tables/scoreboards for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    console.log('[TABLES_COUNT] Counting tables for org:', orgNummer);

    // Query all tables for this organization
    const snapshot = await db.collection('tables')
      .where('org_nummer', '==', orgNummer)
      .get();

    const count = snapshot.size;
    logQueryResult('tables', orgNummer, count);

    console.log(`[TABLES_COUNT] Found ${count} tables for org ${orgNummer}`);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[TABLES_COUNT] Error counting tables:', error);
    return NextResponse.json(
      { error: 'Fout bij tellen tafels', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
