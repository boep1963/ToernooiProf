import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string; tableNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/scoreboards/:tableNr
 * Get scoreboard data for a specific table - includes table status, match info, and score data
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    console.log(`[SCOREBOARD] Getting scoreboard data for org:${orgNummer} table:${tafelNr}`);

    // Get device config for this table
    const deviceSnapshot = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    const deviceConfig = deviceSnapshot.empty
      ? { soort: 1 } // default to mouse
      : deviceSnapshot.docs[0].data();

    // Get table status (active match on this table)
    const tableSnapshot = await db.collection('tables')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    let tableData = null;
    let matchData = null;
    let scoreData = null;
    let competitionData = null;

    if (!tableSnapshot.empty) {
      const tDoc = tableSnapshot.docs[0];
      tableData = { id: tDoc.id, ...tDoc.data() };
      const td = tableData as Record<string, unknown>;

      // Get score helper data for this match
      if (td.u_code && td.comp_nr) {
        const scoreSnapshot = await db.collection('score_helpers')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', td.comp_nr)
          .where('uitslag_code', '==', td.u_code)
          .get();

        if (!scoreSnapshot.empty) {
          // Get latest score entry (highest brt)
          let latestScore: Record<string, unknown> | null = null;
          scoreSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data && (!latestScore || (data.brt as number) > (latestScore.brt as number))) {
              latestScore = { id: doc.id, ...data } as Record<string, unknown>;
            }
          });
          scoreData = latestScore;
        }

        // Get match data
        const matchSnapshot = await db.collection('matches')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', td.comp_nr)
          .where('uitslag_code', '==', td.u_code)
          .get();

        if (!matchSnapshot.empty) {
          const mDoc = matchSnapshot.docs[0];
          matchData = { id: mDoc.id, ...mDoc.data() };
        }

        // Get competition data
        const compSnapshot = await db.collection('competitions')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', td.comp_nr)
          .get();

        if (!compSnapshot.empty) {
          const cDoc = compSnapshot.docs[0];
          competitionData = { id: cDoc.id, ...cDoc.data() };
        }
      }
    }

    // Get organization info
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .get();

    const orgData = orgSnapshot.empty ? null : orgSnapshot.docs[0].data();

    return NextResponse.json({
      tafel_nr: tafelNr,
      org_nummer: orgNummer,
      org_naam: orgData?.org_naam || '',
      device_config: deviceConfig,
      table: tableData,
      match: matchData,
      score: scoreData,
      competition: competitionData,
      status: tableData ? (tableData as Record<string, unknown>).status : 0,
    });
  } catch (error) {
    console.error('[SCOREBOARD] Error fetching scoreboard data:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen scorebord gegevens.' },
      { status: 500 }
    );
  }
}
