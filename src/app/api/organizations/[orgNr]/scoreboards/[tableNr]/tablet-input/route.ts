import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string; tableNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/scoreboards/:tableNr/tablet-input
 * Submit a score input from the tablet interface.
 *
 * Body: { player: 'A' | 'B', serie: number }
 *
 * This updates the score_helpers_tablet collection with the current series,
 * updates the main score_helpers with the accumulated score,
 * and handles turn switching.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, tableNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const tafelNr = parseInt(tableNr, 10);

    if (isNaN(orgNummer) || isNaN(tafelNr)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { player, serie } = body;

    if (!player || (player !== 'A' && player !== 'B')) {
      return NextResponse.json(
        { error: 'Ongeldige speler. Gebruik A of B.' },
        { status: 400 }
      );
    }

    if (typeof serie !== 'number' || serie < 0) {
      return NextResponse.json(
        { error: 'Ongeldige serie waarde.' },
        { status: 400 }
      );
    }

    console.log(`[TABLET_INPUT] org:${orgNummer} table:${tafelNr} player:${player} serie:${serie}`);

    // Get current table status
    const tableSnapshot = await db.collection('tables')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    if (tableSnapshot.empty) {
      return NextResponse.json(
        { error: 'Tafel niet gevonden.' },
        { status: 404 }
      );
    }

    const tableData = tableSnapshot.docs[0].data();
    const compNr = tableData?.comp_nr;
    const uCode = tableData?.u_code;

    if (!compNr || !uCode) {
      return NextResponse.json(
        { error: 'Geen actieve partij op deze tafel.' },
        { status: 400 }
      );
    }

    // Get current score helper data
    const scoreSnapshot = await db.collection('score_helpers')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    let scoreData: Record<string, unknown>;
    let scoreDocRef;

    if (scoreSnapshot.empty) {
      // Create initial score helper
      scoreData = {
        org_nummer: orgNummer,
        comp_nr: compNr,
        uitslag_code: uCode,
        tafel_nr: tafelNr,
        car_A_gem: 0,
        car_B_gem: 0,
        hs_A: 0,
        hs_B: 0,
        brt: 0,
        turn: 1,
        alert: 0,
      };
      scoreDocRef = await db.collection('score_helpers').add(scoreData);
    } else {
      scoreDocRef = scoreSnapshot.docs[0].ref;
      scoreData = scoreSnapshot.docs[0].data() || {};
    }

    // Update score based on series input
    const currentCarA = (scoreData.car_A_gem as number) || 0;
    const currentCarB = (scoreData.car_B_gem as number) || 0;
    const currentHsA = (scoreData.hs_A as number) || 0;
    const currentHsB = (scoreData.hs_B as number) || 0;
    const currentBrt = (scoreData.brt as number) || 0;
    const currentTurn = (scoreData.turn as number) || 1;

    const updates: Record<string, unknown> = {};

    if (player === 'A') {
      updates.car_A_gem = currentCarA + serie;
      if (serie > currentHsA) {
        updates.hs_A = serie;
      }
      // Switch turn to B and increment beurten
      updates.turn = 2;
      updates.brt = currentBrt + 1;
    } else {
      updates.car_B_gem = currentCarB + serie;
      if (serie > currentHsB) {
        updates.hs_B = serie;
      }
      // Switch turn to A (no increment - beurten counted on A's turn)
      updates.turn = 1;
    }

    // Get match data to check for max beurten alert
    const matchSnapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .where('uitslag_code', '==', uCode)
      .get();

    if (!matchSnapshot.empty) {
      const matchData = matchSnapshot.docs[0].data();
      // Check competition for max_beurten
      if (compNr) {
        const compSnapshot = await db.collection('competitions')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', compNr)
          .get();

        if (!compSnapshot.empty) {
          const compData = compSnapshot.docs[0].data();
          const maxBeurten = (compData?.max_beurten as number) || 0;
          const newBrt = (updates.brt as number) || currentBrt;
          if (maxBeurten > 0 && newBrt >= maxBeurten - 1) {
            updates.alert = 1;
          }
        }
      }

      // Check if match target reached
      const cartemA = (matchData?.cartem_A as number) || 0;
      const cartemB = (matchData?.cartem_B as number) || 0;
      const newCarA = (updates.car_A_gem as number) || currentCarA;
      const newCarB = (updates.car_B_gem as number) || currentCarB;

      if (newCarA >= cartemA || newCarB >= cartemB) {
        // Match complete - could update table status
        console.log(`[TABLET_INPUT] Match target reached: A=${newCarA}/${cartemA} B=${newCarB}/${cartemB}`);
      }
    }

    // Apply updates to score helper
    await scoreDocRef.update(updates);

    // Also update/create tablet score helper for series tracking
    const tabletSnapshot = await db.collection('score_helpers_tablet')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    const tabletData = {
      org_nummer: orgNummer,
      comp_nr: compNr,
      uitslag_code: uCode,
      tafel_nr: tafelNr,
      serie_A: player === 'A' ? 0 : ((tabletSnapshot.empty ? 0 : (tabletSnapshot.docs[0].data()?.serie_A as number)) || 0),
      serie_B: player === 'B' ? 0 : ((tabletSnapshot.empty ? 0 : (tabletSnapshot.docs[0].data()?.serie_B as number)) || 0),
    };

    if (tabletSnapshot.empty) {
      await db.collection('score_helpers_tablet').add(tabletData);
    } else {
      await tabletSnapshot.docs[0].ref.update(tabletData);
    }

    console.log(`[TABLET_INPUT] Score updated successfully for player ${player}`);

    return NextResponse.json({
      success: true,
      player,
      serie,
      updates,
    });
  } catch (error) {
    console.error('[TABLET_INPUT] Error processing tablet input:', error);
    return NextResponse.json(
      { error: 'Fout bij verwerken van invoer.' },
      { status: 500 }
    );
  }
}
