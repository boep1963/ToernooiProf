import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; periodNr: string }>;
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/periods/:periodNr
 * Delete a period and clean up related data (matches, results)
 * Can only delete the current (latest) period
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, periodNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    const periodeNr = parseInt(periodNr, 10);

    if (isNaN(compNumber) || isNaN(periodeNr)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    // Get competition
    console.log('[PERIODS] Fetching competition for period deletion...');
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
    const compData = compDoc.data();
    const currentPeriode = compData?.periode || 1;

    // Can only delete the current (latest) period
    if (periodeNr !== currentPeriode) {
      return NextResponse.json(
        { error: `Alleen de huidige periode (${currentPeriode}) kan worden verwijderd.` },
        { status: 400 }
      );
    }

    // Cannot delete period 1
    if (periodeNr <= 1) {
      return NextResponse.json(
        { error: 'Periode 1 kan niet worden verwijderd.' },
        { status: 400 }
      );
    }

    const previousPeriode = currentPeriode - 1;

    // Delete matches for this period
    console.log(`[PERIODS] Deleting matches for period ${periodeNr}...`);
    const matchesSnapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .where('periode', '==', periodeNr)
      .get();

    let deletedMatches = 0;
    for (const doc of matchesSnapshot.docs) {
      await doc.ref.delete();
      deletedMatches++;
    }
    console.log(`[PERIODS] Deleted ${deletedMatches} matches`);

    // Delete results for this period
    console.log(`[PERIODS] Deleting results for period ${periodeNr}...`);
    const resultsSnapshot = await db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .where('periode', '==', periodeNr)
      .get();

    let deletedResults = 0;
    for (const doc of resultsSnapshot.docs) {
      await doc.ref.delete();
      deletedResults++;
    }
    console.log(`[PERIODS] Deleted ${deletedResults} results`);

    // Clear player moyenne/caramboles for the deleted period
    const moyKey = `spc_moyenne_${periodeNr}`;
    const carKey = `spc_car_${periodeNr}`;

    console.log(`[PERIODS] Clearing player data for period ${periodeNr}...`);
    const playersSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .get();

    let clearedPlayers = 0;
    for (const doc of playersSnapshot.docs) {
      await doc.ref.update({
        [moyKey]: 0,
        [carKey]: 0,
      });
      clearedPlayers++;
    }
    console.log(`[PERIODS] Cleared data for ${clearedPlayers} players`);

    // Decrement competition periode
    console.log(`[PERIODS] Reverting competition period from ${currentPeriode} to ${previousPeriode}`);
    await compDoc.ref.update({ periode: previousPeriode });

    return NextResponse.json({
      message: `Periode ${periodeNr} is succesvol verwijderd`,
      deleted_matches: deletedMatches,
      deleted_results: deletedResults,
      cleared_players: clearedPlayers,
      new_periode: previousPeriode,
    });
  } catch (error) {
    console.error('[PERIODS] Error deleting period:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen periode', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
