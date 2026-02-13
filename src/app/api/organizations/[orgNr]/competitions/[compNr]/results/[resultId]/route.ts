import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; resultId: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/results/:resultId
 * Get a single result by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, resultId } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber) || !resultId) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    const doc = await db.collection('results').doc(resultId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Uitslag niet gevonden' },
        { status: 404 }
      );
    }

    const data = doc.data();

    // Security: ensure result belongs to this org and competition
    if (data?.org_nummer !== orgNummer || data?.comp_nr !== compNumber) {
      return NextResponse.json(
        { error: 'Uitslag niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: doc.id, ...data });
  } catch (error) {
    console.error('[RESULTS] Error fetching result:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen uitslag', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/results/:resultId
 * Delete a match result and reset the match to unplayed
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, resultId } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber) || !resultId) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    // Get the result to find the uitslag_code
    const doc = await db.collection('results').doc(resultId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Uitslag niet gevonden' },
        { status: 404 }
      );
    }

    const resultData = doc.data();

    // Security: ensure result belongs to this org and competition
    if (resultData?.org_nummer !== orgNummer || resultData?.comp_nr !== compNumber) {
      return NextResponse.json(
        { error: 'Uitslag niet gevonden' },
        { status: 404 }
      );
    }

    const uitslagCode = resultData?.uitslag_code;

    // Delete the result
    await db.collection('results').doc(resultId).delete();
    console.log(`[RESULTS] Deleted result ${resultId}`);

    // Reset the match to unplayed (gespeeld=0)
    if (uitslagCode) {
      const matchSnapshot = await db.collection('matches')
        .where('org_nummer', '==', orgNummer)
        .where('comp_nr', '==', compNumber)
        .where('uitslag_code', '==', uitslagCode)
        .limit(1)
        .get();

      if (!matchSnapshot.empty) {
        await matchSnapshot.docs[0].ref.update({ gespeeld: 0 });
        console.log(`[RESULTS] Reset match ${uitslagCode} to unplayed`);
      }
    }

    return NextResponse.json({
      message: 'Uitslag succesvol verwijderd',
      deleted_id: resultId,
      uitslag_code: uitslagCode,
    });
  } catch (error) {
    console.error('[RESULTS] Error deleting result:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen uitslag', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
