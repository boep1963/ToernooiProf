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
 *
 * Returns the count from (in priority order):
 * 1. tables collection (if documents exist)
 * 2. organization.aantal_tafels field (if tables collection is empty)
 * 3. unique tafel values from matches collection (if neither above exists)
 * 4. unique tafel_nr values from results collection (if all above are empty)
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

    let count = snapshot.size;
    let source: 'tables' | 'config' | 'matches' | 'results' | 'none' = snapshot.size > 0 ? 'tables' : 'none';
    logQueryResult('tables', orgNummer, count);

    // Fallback 1: Check organization document for aantal_tafels field
    if (count === 0) {
      console.log('[TABLES_COUNT] No tables found in collection, checking organization document');

      const orgSnapshot = await db.collection('organizations')
        .where('org_nummer', '==', orgNummer)
        .limit(1)
        .get();

      if (!orgSnapshot.empty) {
        const orgData = orgSnapshot.docs[0].data();
        const aantalTafels = orgData.aantal_tafels;

        if (typeof aantalTafels === 'number' && aantalTafels > 0) {
          count = aantalTafels;
          source = 'config';
          console.log(`[TABLES_COUNT] Using aantal_tafels from organization: ${count}`);
        }
      }
    }

    // Fallback 2: Count unique table numbers from matches collection
    if (count === 0) {
      console.log('[TABLES_COUNT] No aantal_tafels in organization, checking matches collection');

      const matchesSnapshot = await db.collection('matches')
        .where('org_nummer', '==', orgNummer)
        .get();

      const uniqueTables = new Set<number>();
      matchesSnapshot.docs.forEach(doc => {
        const tafel = doc.data().tafel;
        if (typeof tafel === 'number' && tafel > 0) {
          uniqueTables.add(tafel);
        }
      });

      if (uniqueTables.size > 0) {
        count = uniqueTables.size;
        source = 'matches';
        console.log(`[TABLES_COUNT] Found ${count} unique tables in matches`);
      }
    }

    // Fallback 3: Count unique table numbers from results collection
    if (count === 0) {
      console.log('[TABLES_COUNT] No tables in matches, checking results collection');

      const resultsSnapshot = await db.collection('results')
        .where('org_nummer', '==', orgNummer)
        .get();

      const uniqueTables = new Set<number>();
      resultsSnapshot.docs.forEach(doc => {
        const tafelNr = doc.data().tafel_nr;
        if (typeof tafelNr === 'number' && tafelNr > 0) {
          uniqueTables.add(tafelNr);
        }
      });

      if (uniqueTables.size > 0) {
        count = uniqueTables.size;
        source = 'results';
        console.log(`[TABLES_COUNT] Found ${count} unique tables in results`);
      }
    }

    console.log(`[TABLES_COUNT] Final count for org ${orgNummer}: ${count} (source: ${source})`);
    return NextResponse.json({ count, source });
  } catch (error) {
    console.error('[TABLES_COUNT] Error counting tables:', error);
    return NextResponse.json(
      { error: 'Fout bij tellen tafels', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
