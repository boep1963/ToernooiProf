import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { calculateCaramboles } from '@/lib/billiards';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/periods
 * Get period info: current period, player data per period
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

    // Get competition
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

    const compData = compSnapshot.docs[0].data();
    const currentPeriode = compData?.periode || 1;

    // Get players
    const playersSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .get();

    const players: Record<string, unknown>[] = [];
    playersSnapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      periode: currentPeriode,
      players,
      max_periode: 5,
      can_create: currentPeriode < 5,
    });
  } catch (error) {
    console.error('[PERIODS] Error fetching period info:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen periode-informatie' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/periods
 * Create a new period: increment competition.periode, update player moyennes/caramboles
 *
 * Body: {
 *   players: Array<{
 *     spc_nummer: number;
 *     update_moyenne: boolean;
 *     new_moyenne: number;
 *     new_caramboles: number;
 *   }>
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Get competition
    console.log('[PERIODS] Fetching competition for period creation...');
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
    const newPeriode = currentPeriode + 1;

    // Enforce maximum 5 periods
    if (currentPeriode >= 5) {
      return NextResponse.json(
        { error: 'Maximaal 5 periodes bereikt. Er kan geen nieuwe periode worden aangemaakt.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const playerUpdates: Array<{
      spc_nummer: number;
      update_moyenne: boolean;
      new_moyenne: number;
      new_caramboles: number;
    }> = body.players || [];

    // Update competition periode
    console.log(`[PERIODS] Updating competition period from ${currentPeriode} to ${newPeriode}`);
    await compDoc.ref.update({ periode: newPeriode });

    // Update player moyennes and caramboles for the new period
    const moyKey = `spc_moyenne_${newPeriode}`;
    const carKey = `spc_car_${newPeriode}`;
    const oldMoyKey = `spc_moyenne_${currentPeriode}`;
    const oldCarKey = `spc_car_${currentPeriode}`;

    let updatedPlayers = 0;

    for (const playerUpdate of playerUpdates) {
      const playerSnapshot = await db.collection('competition_players')
        .where('spc_org', '==', orgNummer)
        .where('spc_competitie', '==', compNumber)
        .where('spc_nummer', '==', playerUpdate.spc_nummer)
        .limit(1)
        .get();

      if (!playerSnapshot.empty) {
        const playerDoc = playerSnapshot.docs[0];
        const playerData = playerDoc.data();

        if (playerUpdate.update_moyenne) {
          // Update with new calculated moyenne and caramboles
          console.log(`[PERIODS] Updating player ${playerUpdate.spc_nummer}: moyenne=${playerUpdate.new_moyenne}, car=${playerUpdate.new_caramboles}`);
          await playerDoc.ref.update({
            [moyKey]: playerUpdate.new_moyenne,
            [carKey]: playerUpdate.new_caramboles,
          });
        } else {
          // Carry over the current period's values to the new period
          const currentMoy = Number(playerData?.[oldMoyKey]) || 0;
          const currentCar = Number(playerData?.[oldCarKey]) || 0;
          console.log(`[PERIODS] Carrying over player ${playerUpdate.spc_nummer}: moyenne=${currentMoy}, car=${currentCar}`);
          await playerDoc.ref.update({
            [moyKey]: currentMoy,
            [carKey]: currentCar,
          });
        }
        updatedPlayers++;
      }
    }

    // If no player updates provided, carry over all players' values
    if (playerUpdates.length === 0) {
      const allPlayersSnapshot = await db.collection('competition_players')
        .where('spc_org', '==', orgNummer)
        .where('spc_competitie', '==', compNumber)
        .get();

      for (const doc of allPlayersSnapshot.docs) {
        const data = doc.data();
        const currentMoy = Number(data?.[oldMoyKey]) || 0;
        const currentCar = Number(data?.[oldCarKey]) || 0;
        await doc.ref.update({
          [moyKey]: currentMoy,
          [carKey]: currentCar,
        });
        updatedPlayers++;
      }
    }

    console.log(`[PERIODS] Period ${newPeriode} created. Updated ${updatedPlayers} players.`);

    return NextResponse.json({
      message: `Periode ${newPeriode} is succesvol aangemaakt`,
      old_periode: currentPeriode,
      new_periode: newPeriode,
      updated_players: updatedPlayers,
    }, { status: 201 });
  } catch (error) {
    console.error('[PERIODS] Error creating period:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken nieuwe periode', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
