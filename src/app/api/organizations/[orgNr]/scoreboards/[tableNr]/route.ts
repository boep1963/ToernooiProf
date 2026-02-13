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

/**
 * PUT /api/organizations/:orgNr/scoreboards/:tableNr
 * Update table status - assign match, start/stop match
 *
 * Body options:
 * - { action: 'assign', comp_nr, uitslag_code } - Assign a match to table (status=0 waiting)
 * - { action: 'start' } - Start the match (status=1 started)
 * - { action: 'finish' } - Finish the match (status=2 result)
 * - { action: 'clear' } - Clear the table (remove assignment)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const action = body.action;

    console.log(`[SCOREBOARD] PUT action:${action} for org:${orgNummer} table:${tafelNr}`);

    // Find existing table record
    const tableSnapshot = await db.collection('tables')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    if (action === 'assign') {
      // Assign a match to this table
      const compNr = Number(body.comp_nr);
      const uitslagCode = String(body.uitslag_code || '');

      if (!compNr || !uitslagCode) {
        return NextResponse.json(
          { error: 'comp_nr en uitslag_code zijn verplicht' },
          { status: 400 }
        );
      }

      const tableData = {
        org_nummer: orgNummer,
        comp_nr: compNr,
        u_code: uitslagCode,
        tafel_nr: tafelNr,
        status: 0, // waiting
      };

      if (tableSnapshot.empty) {
        // Create new table record
        const docRef = await db.collection('tables').add(tableData);
        console.log(`[SCOREBOARD] Created table record: ${docRef.id}`);
        return NextResponse.json({
          id: docRef.id,
          ...tableData,
          message: 'Wedstrijd toegewezen aan tafel',
        });
      } else {
        // Update existing table record
        const docRef = tableSnapshot.docs[0].ref;
        await docRef.update(tableData);
        console.log(`[SCOREBOARD] Updated table record: ${tableSnapshot.docs[0].id}`);
        return NextResponse.json({
          id: tableSnapshot.docs[0].id,
          ...tableData,
          message: 'Wedstrijd toegewezen aan tafel',
        });
      }
    } else if (action === 'start') {
      // Start the match (status 0 → 1)
      if (tableSnapshot.empty) {
        return NextResponse.json(
          { error: 'Geen wedstrijd toegewezen aan deze tafel' },
          { status: 400 }
        );
      }

      const docRef = tableSnapshot.docs[0].ref;
      await docRef.update({ status: 1 });
      const tableData = tableSnapshot.docs[0].data();

      // Initialize score_helpers record for this match
      if (tableData?.u_code && tableData?.comp_nr) {
        const existingScore = await db.collection('score_helpers')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', tableData.comp_nr)
          .where('uitslag_code', '==', tableData.u_code)
          .get();

        if (existingScore.empty) {
          // Get match data for initial caramboles targets
          const matchSnapshot = await db.collection('matches')
            .where('org_nummer', '==', orgNummer)
            .where('comp_nr', '==', tableData.comp_nr)
            .where('uitslag_code', '==', tableData.u_code)
            .limit(1)
            .get();

          const matchData = matchSnapshot.empty ? null : matchSnapshot.docs[0].data();

          await db.collection('score_helpers').add({
            org_nummer: orgNummer,
            comp_nr: tableData.comp_nr,
            uitslag_code: tableData.u_code,
            car_A_tem: matchData?.cartem_A || 0,
            car_A_gem: 0,
            hs_A: 0,
            brt: 0,
            car_B_tem: matchData?.cartem_B || 0,
            car_B_gem: 0,
            hs_B: 0,
            turn: 1, // Player A starts
            alert: 0,
          });
          console.log('[SCOREBOARD] Initialized score_helpers for match');
        }
      }

      console.log(`[SCOREBOARD] Match started on table ${tafelNr}`);
      return NextResponse.json({
        id: tableSnapshot.docs[0].id,
        status: 1,
        message: 'Partij gestart',
      });
    } else if (action === 'finish') {
      // Finish the match (status → 2)
      if (tableSnapshot.empty) {
        return NextResponse.json(
          { error: 'Geen wedstrijd op deze tafel' },
          { status: 400 }
        );
      }

      const docRef = tableSnapshot.docs[0].ref;
      await docRef.update({ status: 2 });

      console.log(`[SCOREBOARD] Match finished on table ${tafelNr}`);
      return NextResponse.json({
        id: tableSnapshot.docs[0].id,
        status: 2,
        message: 'Partij afgelopen',
      });
    } else if (action === 'clear') {
      // Clear the table
      if (!tableSnapshot.empty) {
        await tableSnapshot.docs[0].ref.delete();
        console.log(`[SCOREBOARD] Table ${tafelNr} cleared`);
      }
      return NextResponse.json({
        status: 0,
        message: 'Tafel leeggemaakt',
      });
    } else {
      return NextResponse.json(
        { error: 'Ongeldige actie. Gebruik: assign, start, finish, clear' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[SCOREBOARD] Error updating table:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken tafel', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
