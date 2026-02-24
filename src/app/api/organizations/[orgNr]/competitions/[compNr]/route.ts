import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr
 * Get a specific competition
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[COMPETITION] Querying database for competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    return cachedJsonResponse({ id: doc.id, ...doc.data() }, 'default');
  } catch (error) {
    console.error('[COMPETITION] Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen competitie' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:orgNr/competitions/:compNr
 * Update competition settings
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.comp_naam || typeof body.comp_naam !== 'string' || body.comp_naam.trim() === '') {
      return NextResponse.json(
        { error: 'Competitienaam is verplicht.' },
        { status: 400 }
      );
    }

    if (!body.comp_datum) {
      return NextResponse.json(
        { error: 'Datum is verplicht.' },
        { status: 400 }
      );
    }

    console.log('[COMPETITION] Updating competition:', compNumber, 'in org:', orgNummer);

    // Find the competition
    const snapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {
      comp_naam: body.comp_naam.trim(),
      comp_datum: body.comp_datum,
      discipline: Number(body.discipline) || 1,
      punten_sys: Number(body.punten_sys) || 1,
      moy_form: Number(body.moy_form) || 3,
      min_car: Number(body.min_car) || 10,
      max_beurten: Number(body.max_beurten) || 30,
      vast_beurten: Number(body.vast_beurten) || 0,
      sorteren: Number(body.sorteren) || 1,
      updated_at: new Date().toISOString(),
    };

    await doc.ref.update(updateData);

    console.log(`[COMPETITION] Competition ${compNumber} updated successfully`);

    return NextResponse.json({
      id: doc.id,
      org_nummer: orgNummer,
      comp_nr: compNumber,
      ...updateData,
    });
  } catch (error) {
    console.error('[COMPETITION] Error updating competition:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken competitie' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr
 * Delete a competition and cascade delete all associated data:
 * - competition_players
 * - matches
 * - results
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[COMPETITION] Deleting competition:', compNumber, 'in org:', orgNummer);

    // Find the competition
    const compSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get();

    if (compSnapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const compDoc = compSnapshot.docs[0];
    const cascadeCounts = {
      players: 0,
      matches: 0,
      results: 0,
      tables: 0,
      score_helpers: 0,
      score_helpers_tablet: 0,
    };

    // Cascade delete: competition_players
    console.log('[COMPETITION] Cascade deleting competition_players for comp:', compNumber);
    const playersSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .get();
    for (const doc of playersSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.players++;
    }

    // Cascade delete: matches
    console.log('[COMPETITION] Cascade deleting matches for comp:', compNumber);
    const matchesSnapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();
    for (const doc of matchesSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.matches++;
    }

    // Cascade delete: results
    console.log('[COMPETITION] Cascade deleting results for comp:', compNumber);
    const resultsSnapshot = await db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();
    for (const doc of resultsSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.results++;
    }

    // Cascade delete: tables (if they have comp_nr field)
    console.log('[COMPETITION] Cascade deleting tables for comp:', compNumber);
    const tablesSnapshot = await db.collection('tables')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();
    for (const doc of tablesSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.tables++;
    }

    // Cascade delete: score_helpers
    console.log('[COMPETITION] Cascade deleting score_helpers for comp:', compNumber);
    const scoreHelpersSnapshot = await db.collection('score_helpers')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();
    for (const doc of scoreHelpersSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.score_helpers++;
    }

    // Cascade delete: score_helpers_tablet
    console.log('[COMPETITION] Cascade deleting score_helpers_tablet for comp:', compNumber);
    const scoreHelpersTabletSnapshot = await db.collection('score_helpers_tablet')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();
    for (const doc of scoreHelpersTabletSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.score_helpers_tablet++;
    }

    // Delete the competition itself
    await compDoc.ref.delete();

    console.log(`[COMPETITION] Competition ${compNumber} deleted. Cascade: ${cascadeCounts.players} players, ${cascadeCounts.matches} matches, ${cascadeCounts.results} results, ${cascadeCounts.tables} tables, ${cascadeCounts.score_helpers} score_helpers, ${cascadeCounts.score_helpers_tablet} score_helpers_tablet`);

    return NextResponse.json({
      message: 'Competitie succesvol verwijderd',
      comp_nr: compNumber,
      cascade_deleted: cascadeCounts,
    });
  } catch (error) {
    console.error('[COMPETITION] Error deleting competition:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen competitie' },
      { status: 500 }
    );
  }
}
