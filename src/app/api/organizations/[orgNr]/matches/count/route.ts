import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/matches/count
 * Get total count of matches across all competitions for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    console.log('[MATCHES_COUNT] Counting matches for org:', orgNummer);

    // Query all matches for this organization
    const snapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .get();

    const count = snapshot.size;

    console.log(`[MATCHES_COUNT] Found ${count} matches for org ${orgNummer}`);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[MATCHES_COUNT] Error counting matches:', error);
    return NextResponse.json(
      { error: 'Fout bij tellen wedstrijden', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
