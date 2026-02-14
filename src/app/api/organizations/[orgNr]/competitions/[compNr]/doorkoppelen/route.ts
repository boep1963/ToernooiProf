import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgNr: string; compNr: string }> }
) {
  try {
    const { orgNr, compNr } = await context.params;
    const org_nummer = parseInt(orgNr, 10);
    const comp_nr = parseInt(compNr, 10);

    if (isNaN(org_nummer) || isNaN(comp_nr)) {
      return NextResponse.json(
        { error: 'Ongeldige organisatie of competitie nummer.' },
        { status: 400 }
      );
    }

    // 1. Get competition data
    const competitionsSnapshot = await db
      .collection('competitions')
      .where('org_nummer', '==', org_nummer)
      .where('comp_nr', '==', comp_nr)
      .get();

    if (competitionsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden.' },
        { status: 404 }
      );
    }

    const competition = competitionsSnapshot.docs[0].data();

    // 2. Get all players in this competition
    const playersSnapshot = await db
      .collection('competition_players')
      .where('spc_org', '==', org_nummer)
      .where('spc_competitie', '==', comp_nr)
      .get();

    const players = playersSnapshot.docs.map((doc) => doc.data());

    // 3. For each player, get their results and calculate moyennes per period
    const playerMoyennes = [];

    for (const player of players) {
      const spc_nummer = player.spc_nummer;

      // Get all results for this player
      const resultsSnapshot = await db
        .collection('results')
        .where('org_nummer', '==', org_nummer)
        .where('comp_nr', '==', comp_nr)
        .get();

      const allResults = resultsSnapshot.docs.map((doc) => doc.data());

      // Filter results for this player
      const playerResults = allResults.filter(
        (r: any) => r.sp_1_nr === spc_nummer || r.sp_2_nr === spc_nummer
      );

      // Initialize période stats
      const periodStats: Record<number, { car: number; brt: number }> = {};
      for (let i = 1; i <= 5; i++) {
        periodStats[i] = { car: 0, brt: 0 };
      }

      // Accumulate stats per period
      for (const result of playerResults) {
        const r = result as any;
        const period = r.periode || 1;

        if (r.sp_1_nr === spc_nummer) {
          periodStats[period].car += r.sp_1_cargem || 0;
        } else {
          periodStats[period].car += r.sp_2_cargem || 0;
        }
        periodStats[period].brt += r.brt || 0;
      }

      // Calculate moyennes
      const periodMoyennes: Record<number, number> = {};
      for (let i = 1; i <= 5; i++) {
        if (periodStats[i].brt > 0) {
          periodMoyennes[i] = periodStats[i].car / periodStats[i].brt;
        } else {
          periodMoyennes[i] = 0;
        }
      }

      // Calculate total moyenne
      const totalCar = Object.values(periodStats).reduce((sum, p) => sum + p.car, 0);
      const totalBrt = Object.values(periodStats).reduce((sum, p) => sum + p.brt, 0);
      const totalMoy = totalBrt > 0 ? totalCar / totalBrt : 0;

      // Get player name
      const playerName = [player.spa_vnaam, player.spa_tv, player.spa_anaam]
        .filter(Boolean)
        .join(' ') || `Speler ${spc_nummer}`;

      // Get start moyenne (from period 1)
      const startMoyenne = player.spc_moyenne_1 || 0;

      playerMoyennes.push({
        spc_nummer,
        playerName,
        startMoyenne,
        periode1Moy: periodMoyennes[1],
        periode2Moy: periodMoyennes[2],
        periode3Moy: periodMoyennes[3],
        periode4Moy: periodMoyennes[4],
        periode5Moy: periodMoyennes[5],
        totalMoy,
      });
    }

    // Sort by player name
    playerMoyennes.sort((a, b) => a.playerName.localeCompare(b.playerName));

    return NextResponse.json(playerMoyennes, { status: 200 });
  } catch (error) {
    console.error('Error fetching player moyennes:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van spelergegevens.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orgNr: string; compNr: string }> }
) {
  try {
    const { orgNr, compNr } = await context.params;
    const org_nummer = parseInt(orgNr, 10);
    const comp_nr = parseInt(compNr, 10);

    if (isNaN(org_nummer) || isNaN(comp_nr)) {
      return NextResponse.json(
        { error: 'Ongeldige organisatie of competitie nummer.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { playerIds, period, discipline } = body;

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Geen spelers geselecteerd.' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4, 5, 6].includes(period)) {
      return NextResponse.json(
        { error: 'Ongeldige periode.' },
        { status: 400 }
      );
    }

    // Map discipline to moyenne field in members table
    const moyenneFields: Record<number, string> = {
      1: 'spa_moy_lib',
      2: 'spa_moy_band',
      3: 'spa_moy_3bkl',
      4: 'spa_moy_3bgr',
      5: 'spa_moy_kad',
    };

    const moyenneField = moyenneFields[discipline];
    if (!moyenneField) {
      return NextResponse.json(
        { error: 'Ongeldige discipline.' },
        { status: 400 }
      );
    }

    let updated = 0;

    for (const spc_nummer of playerIds) {
      // 1. Get player data from competition_players
      const playerSnapshot = await db
        .collection('competition_players')
        .where('spc_org', '==', org_nummer)
        .where('spc_competitie', '==', comp_nr)
        .where('spc_nummer', '==', spc_nummer)
        .get();

      if (playerSnapshot.empty) continue;

      const playerDoc = playerSnapshot.docs[0];
      const player = playerDoc.data();

      // 2. Calculate moyenne for selected period
      let moyenneToTransfer = 0;

      if (period === 6) {
        // Total moyenne - calculate from all results
        const resultsSnapshot = await db
          .collection('results')
          .where('org_nummer', '==', org_nummer)
          .where('comp_nr', '==', comp_nr)
          .get();

        const allResults = resultsSnapshot.docs.map((doc) => doc.data());
        const playerResults = allResults.filter(
          (r: any) => r.sp_1_nr === spc_nummer || r.sp_2_nr === spc_nummer
        );

        let totalCar = 0;
        let totalBrt = 0;

        for (const result of playerResults) {
          const r = result as any;
          if (r.sp_1_nr === spc_nummer) {
            totalCar += r.sp_1_cargem || 0;
          } else {
            totalCar += r.sp_2_cargem || 0;
          }
          totalBrt += r.brt || 0;
        }

        moyenneToTransfer = totalBrt > 0 ? totalCar / totalBrt : 0;
      } else {
        // Specific period moyenne - calculate from results in that period
        const resultsSnapshot = await db
          .collection('results')
          .where('org_nummer', '==', org_nummer)
          .where('comp_nr', '==', comp_nr)
          .where('periode', '==', period)
          .get();

        const periodResults = resultsSnapshot.docs.map((doc) => doc.data());
        const playerResults = periodResults.filter(
          (r: any) => r.sp_1_nr === spc_nummer || r.sp_2_nr === spc_nummer
        );

        let periodCar = 0;
        let periodBrt = 0;

        for (const result of playerResults) {
          const r = result as any;
          if (r.sp_1_nr === spc_nummer) {
            periodCar += r.sp_1_cargem || 0;
          } else {
            periodCar += r.sp_2_cargem || 0;
          }
          periodBrt += r.brt || 0;
        }

        moyenneToTransfer = periodBrt > 0 ? periodCar / periodBrt : 0;
      }

      // 3. Update member moyenne in members table
      const memberSnapshot = await db
        .collection('members')
        .where('spa_org', '==', org_nummer)
        .where('spa_nummer', '==', spc_nummer)
        .get();

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await memberDoc.ref.update({
          [moyenneField]: parseFloat(moyenneToTransfer.toFixed(3)),
        });
        updated++;
      }
    }

    return NextResponse.json(
      { message: 'Moyennes succesvol doorgekoppeld', updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating member moyennes:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het doorkoppelen van moyennes.' },
      { status: 500 }
    );
  }
}
