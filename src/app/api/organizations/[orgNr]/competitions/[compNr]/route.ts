import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
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
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('[COMPETITION] Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen competitie' },
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
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
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
    };

    // Cascade delete: competition_players
    console.log('[COMPETITION] Cascade deleting competition_players for comp:', compNumber);
    const playersSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_comp', '==', compNumber)
      .get();
    for (const doc of playersSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.players++;
    }

    // Cascade delete: matches
    console.log('[COMPETITION] Cascade deleting matches for comp:', compNumber);
    const matchesSnapshot = await db.collection('matches')
      .where('wed_org', '==', orgNummer)
      .where('wed_comp', '==', compNumber)
      .get();
    for (const doc of matchesSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.matches++;
    }

    // Cascade delete: results
    console.log('[COMPETITION] Cascade deleting results for comp:', compNumber);
    const resultsSnapshot = await db.collection('results')
      .where('uit_org', '==', orgNummer)
      .where('uit_comp', '==', compNumber)
      .get();
    for (const doc of resultsSnapshot.docs) {
      await doc.ref.delete();
      cascadeCounts.results++;
    }

    // Delete the competition itself
    await compDoc.ref.delete();

    console.log(`[COMPETITION] Competition ${compNumber} deleted. Cascade: ${cascadeCounts.players} players, ${cascadeCounts.matches} matches, ${cascadeCounts.results} results`);

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
