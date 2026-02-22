import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { formatPlayerName } from '@/lib/billiards';
import { batchEnrichPlayerNames } from '@/lib/batchEnrichment';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; period: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/standings/:period
 * Calculate and return standings for a competition period.
 *
 * Aggregates all results for the given period and calculates:
 * - matches played, caramboles made/target, percentage, turns, moyenne, highest serie, points
 * - Sort: points desc, percentage desc, moyenne desc, highest serie desc
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, period } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);
    const periodNumber = parseInt(period, 10);

    if (isNaN(orgNummer) || isNaN(compNumber) || isNaN(periodNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log(`[STANDINGS] Calculating standings for competition ${compNumber}, period ${periodNumber}, org ${orgNummer}`);

    // Fetch competition details
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
    const sorteren = Number(compData?.sorteren) || 1;

    // Fetch all competition players
    const playersSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .get();

    // Prepare players for batch enrichment
    const playersToEnrich = playersSnapshot.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));

    // Use batch enrichment to fetch all missing names efficiently
    const enrichedPlayers = await batchEnrichPlayerNames(
      orgNummer,
      playersToEnrich,
      true // persist to Firestore
    );

    // Build player name map from enriched players
    const playerMap: Record<number, { name: string; nr: number }> = {};

    for (const player of enrichedPlayers) {
      const nr = Number(player.spc_nummer);
      const name = formatPlayerName(player.spa_vnaam, player.spa_tv, player.spa_anaam, sorteren);
      playerMap[nr] = { name, nr };
    }

    // Fetch all results for this competition and period
    // Period 0 means "Totaal" (all periods combined)
    let resultsQuery = db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber);

    if (periodNumber !== 0) {
      resultsQuery = resultsQuery.where('periode', '==', periodNumber);
    }

    const resultsSnapshot = await resultsQuery.get();

    // Initialize standings per player
    const standingsMap: Record<number, {
      playerNr: number;
      playerName: string;
      matchesPlayed: number;
      carambolesGemaakt: number;
      carambolesTeMaken: number;
      beurten: number;
      hoogsteSerie: number;
      punten: number;
      partijMoyennes: number[]; // Track individual match moyennes for P.moy calculation
    }> = {};

    // Initialize all players with zero stats
    for (const nr of Object.keys(playerMap)) {
      const playerNr = parseInt(nr, 10);
      standingsMap[playerNr] = {
        playerNr,
        playerName: playerMap[playerNr].name,
        matchesPlayed: 0,
        carambolesGemaakt: 0,
        carambolesTeMaken: 0,
        beurten: 0,
        hoogsteSerie: 0,
        punten: 0,
        partijMoyennes: [],
      };
    }

    // Aggregate results
    resultsSnapshot.forEach((doc) => {
      const result = doc.data();
      if (!result) return;

      const p1Punt = Number(result.sp_1_punt) || 0;
      const p2Punt = Number(result.sp_2_punt) || 0;
      const brt = Number(result.brt) || 0;
      const p1Car = Number(result.sp_1_cargem) || 0;
      const p2Car = Number(result.sp_2_cargem) || 0;

      // Player 1 stats
      const p1Nr = Number(result.sp_1_nr);
      if (standingsMap[p1Nr]) {
        standingsMap[p1Nr].matchesPlayed += 1;
        standingsMap[p1Nr].carambolesGemaakt += p1Car;
        standingsMap[p1Nr].carambolesTeMaken += Number(result.sp_1_cartem) || 0;
        standingsMap[p1Nr].beurten += brt;
        standingsMap[p1Nr].hoogsteSerie = Math.max(
          standingsMap[p1Nr].hoogsteSerie,
          Number(result.sp_1_hs) || 0
        );
        standingsMap[p1Nr].punten += p1Punt;
        // For P.moy: only track match moyenne if player won or drew
        if (p1Punt >= p2Punt && brt > 0) {
          standingsMap[p1Nr].partijMoyennes.push(p1Car / brt);
        }
      } else {
        // Player not in competition players but has a result - add them
        const partijMoyennes: number[] = [];
        if (p1Punt >= p2Punt && brt > 0) {
          partijMoyennes.push(p1Car / brt);
        }
        standingsMap[p1Nr] = {
          playerNr: p1Nr,
          playerName: playerMap[p1Nr]?.name || `Speler ${p1Nr}`,
          matchesPlayed: 1,
          carambolesGemaakt: p1Car,
          carambolesTeMaken: Number(result.sp_1_cartem) || 0,
          beurten: brt,
          hoogsteSerie: Number(result.sp_1_hs) || 0,
          punten: p1Punt,
          partijMoyennes,
        };
      }

      // Player 2 stats
      const p2Nr = Number(result.sp_2_nr);
      if (standingsMap[p2Nr]) {
        standingsMap[p2Nr].matchesPlayed += 1;
        standingsMap[p2Nr].carambolesGemaakt += p2Car;
        standingsMap[p2Nr].carambolesTeMaken += Number(result.sp_2_cartem) || 0;
        standingsMap[p2Nr].beurten += brt;
        standingsMap[p2Nr].hoogsteSerie = Math.max(
          standingsMap[p2Nr].hoogsteSerie,
          Number(result.sp_2_hs) || 0
        );
        standingsMap[p2Nr].punten += p2Punt;
        // For P.moy: only track match moyenne if player won or drew
        if (p2Punt >= p1Punt && brt > 0) {
          standingsMap[p2Nr].partijMoyennes.push(p2Car / brt);
        }
      } else {
        const partijMoyennes: number[] = [];
        if (p2Punt >= p1Punt && brt > 0) {
          partijMoyennes.push(p2Car / brt);
        }
        standingsMap[p2Nr] = {
          playerNr: p2Nr,
          playerName: playerMap[p2Nr]?.name || `Speler ${p2Nr}`,
          matchesPlayed: 1,
          carambolesGemaakt: p2Car,
          carambolesTeMaken: Number(result.sp_2_cartem) || 0,
          beurten: brt,
          hoogsteSerie: Number(result.sp_2_hs) || 0,
          punten: p2Punt,
          partijMoyennes,
        };
      }
    });

    // Calculate derived fields and sort
    const standings = Object.values(standingsMap).map((entry) => {
      const percentage = entry.carambolesTeMaken > 0
        ? (entry.carambolesGemaakt / entry.carambolesTeMaken) * 100
        : 0;
      const moyenne = entry.beurten > 0
        ? entry.carambolesGemaakt / entry.beurten
        : 0;
      // P.moy = highest moyenne from matches the player won or drew
      // If no wins or draws, P.moy = 0.000
      const partijMoyenne = entry.partijMoyennes.length > 0
        ? Math.max(...entry.partijMoyennes)
        : 0;

      return {
        playerNr: entry.playerNr,
        playerName: entry.playerName,
        matchesPlayed: entry.matchesPlayed,
        carambolesGemaakt: entry.carambolesGemaakt,
        carambolesTeMaken: entry.carambolesTeMaken,
        beurten: entry.beurten,
        hoogsteSerie: entry.hoogsteSerie,
        punten: entry.punten,
        percentage: Math.round(percentage * 100) / 100, // 2 decimal places
        moyenne: Math.round(moyenne * 1000) / 1000, // 3 decimal places
        partijMoyenne: Math.round(partijMoyenne * 100) / 100, // 2 decimal places
      };
    });

    // Sort: points desc, percentage desc, moyenne desc, highest serie desc
    standings.sort((a, b) => {
      if (b.punten !== a.punten) return b.punten - a.punten;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne;
      return b.hoogsteSerie - a.hoogsteSerie;
    });

    // Assign ranks
    const rankedStandings = standings.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    console.log(`[STANDINGS] Calculated standings for ${rankedStandings.length} players`);

    return NextResponse.json({
      standings: rankedStandings,
      count: rankedStandings.length,
      competition: {
        comp_nr: compNumber,
        comp_naam: compData?.comp_naam || '',
        discipline: compData?.discipline || 1,
        punten_sys: compData?.punten_sys || 1,
        periode: periodNumber,
      },
    });
  } catch (error) {
    console.error('[STANDINGS] Error calculating standings:', error);
    return NextResponse.json(
      { error: 'Fout bij berekenen stand', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
