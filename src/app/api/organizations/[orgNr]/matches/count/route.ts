import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { normalizeOrgNummer, logQueryResult } from '@/lib/orgNumberUtils';

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
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    console.log('[MATCHES_COUNT] Counting matches for org:', orgNummer);

    // Query all matches for this organization
    const snapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .get();

    let count = snapshot.size;
    let source = 'matches';
    logQueryResult('matches', orgNummer, count);

    // Fallback: If no matches found, count unique results (uitslag_code)
    if (count === 0) {
      console.log('[MATCHES_COUNT] No matches found, falling back to results collection');
      const resultsSnapshot = await db.collection('results')
        .where('org_nummer', '==', orgNummer)
        .get();

      // Count unique uitslag_code values
      const uniqueCodes = new Set<string>();
      resultsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uitslag_code) {
          uniqueCodes.add(String(data.uitslag_code));
        }
      });

      count = uniqueCodes.size;
      source = 'results';
      logQueryResult('results', orgNummer, resultsSnapshot.size);
      console.log(`[MATCHES_COUNT] Found ${resultsSnapshot.size} results with ${count} unique match codes`);
    }

    console.log(`[MATCHES_COUNT] Final count: ${count} from ${source} for org ${orgNummer}`);
    return NextResponse.json({ count, source });
  } catch (error) {
    console.error('[MATCHES_COUNT] Error counting matches:', error);
    return NextResponse.json(
      { error: 'Fout bij tellen wedstrijden', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
