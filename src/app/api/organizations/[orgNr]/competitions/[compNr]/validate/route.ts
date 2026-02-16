import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
}

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

    const issues: ValidationIssue[] = [];

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

    const competitionDoc = competitionsSnapshot.docs[0];
    const competition = competitionDoc.data();

    // 2. Get all players in this competition
    const playersSnapshot = await db
      .collection('competition_players')
      .where('spc_org', '==', org_nummer)
      .where('spc_competitie', '==', comp_nr)
      .get();

    const players = playersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const playerIds = players.map((p: any) => p.spc_nummer);

    // 3. Verify all players exist in members table
    if (playerIds.length > 0) {
      for (const spa_nummer of playerIds) {
        const memberSnapshot = await db
          .collection('members')
          .where('spa_org', '==', org_nummer)
          .where('spa_nummer', '==', spa_nummer)
          .get();

        if (memberSnapshot.empty) {
          issues.push({
            type: 'error',
            category: 'Spelers',
            message: `Speler ${spa_nummer} bestaat niet in de ledenlijst`,
            details: 'Deze speler is toegevoegd aan de competitie maar bestaat niet meer in de ledenlijst.',
          });
        }
      }
    } else {
      issues.push({
        type: 'warning',
        category: 'Spelers',
        message: 'Geen spelers toegevoegd aan deze competitie',
        details: 'Voeg spelers toe om wedstrijden te kunnen plannen.',
      });
    }

    // 4. Get all matches for this competition
    const matchesSnapshot = await db
      .collection('matches')
      .where('org_nummer', '==', org_nummer)
      .where('comp_nr', '==', comp_nr)
      .get();

    const matches = matchesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 5. Verify all matches reference valid players
    for (const match of matches) {
      const m = match as any;

      if (!playerIds.includes(m.nummer_A)) {
        issues.push({
          type: 'error',
          category: 'Wedstrijden',
          message: `Wedstrijd ${m.uitslag_code} verwijst naar onbekende speler ${m.nummer_A}`,
          details: 'Deze speler is niet toegevoegd aan de competitie.',
        });
      }

      if (!playerIds.includes(m.nummer_B)) {
        issues.push({
          type: 'error',
          category: 'Wedstrijden',
          message: `Wedstrijd ${m.uitslag_code} verwijst naar onbekende speler ${m.nummer_B}`,
          details: 'Deze speler is niet toegevoegd aan de competitie.',
        });
      }

      // Check for duplicate player in same match
      if (m.nummer_A === m.nummer_B) {
        issues.push({
          type: 'error',
          category: 'Wedstrijden',
          message: `Wedstrijd ${m.uitslag_code} heeft dezelfde speler aan beide kanten`,
          details: `Speler ${m.nummer_A} kan niet tegen zichzelf spelen.`,
        });
      }
    }

    // 6. Get all results for this competition
    const resultsSnapshot = await db
      .collection('results')
      .where('org_nummer', '==', org_nummer)
      .where('comp_nr', '==', comp_nr)
      .get();

    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const matchCodes = matches.map((m: any) => m.uitslag_code);

    // 7. Count results with and without corresponding matches
    // Note: Results without matches are NORMAL - matches are a temporary queue
    // that gets removed after a game is played. Only the result remains.
    const resultsWithoutMatch = results.filter(
      (r: any) => !matchCodes.includes(r.uitslag_code)
    );

    if (resultsWithoutMatch.length > 0) {
      issues.push({
        type: 'info',
        category: 'Uitslagen',
        message: `${resultsWithoutMatch.length} uitslag(en) correct verwerkt (wedstrijden gespeeld)`,
        details: 'Deze uitslagen hebben geen openstaande wedstrijd meer, wat normaal is na het spelen.',
      });
    }

    for (const result of results) {
      const r = result as any;

      // Validate result data consistency
      if (r.sp_1_cargem < 0 || r.sp_2_cargem < 0) {
        issues.push({
          type: 'error',
          category: 'Uitslagen',
          message: `Uitslag ${r.uitslag_code} heeft negatieve caramboles`,
          details: 'Caramboles kunnen niet negatief zijn.',
        });
      }

      if (r.brt <= 0) {
        issues.push({
          type: 'error',
          category: 'Uitslagen',
          message: `Uitslag ${r.uitslag_code} heeft ongeldige beurten (${r.brt})`,
          details: 'Het aantal beurten moet groter dan 0 zijn.',
        });
      }

      // Check for negative points (only valid in some point systems)
      if ((r.sp_1_punt < 0 || r.sp_2_punt < 0) && competition.punten_sys !== 2) {
        issues.push({
          type: 'warning',
          category: 'Uitslagen',
          message: `Uitslag ${r.uitslag_code} heeft negatieve punten`,
          details: 'Controleer of de puntentelling correct is.',
        });
      }
    }

    // 8. Check for matches without results (upcoming/unplayed matches)
    const resultMatchCodes = results.map((r: any) => r.uitslag_code);
    const matchesWithoutResults = matches.filter(
      (m: any) => !resultMatchCodes.includes(m.uitslag_code)
    );

    if (matchesWithoutResults.length > 0) {
      issues.push({
        type: 'info',
        category: 'Uitslagen',
        message: `${matchesWithoutResults.length} wedstrijd(en) nog niet gespeeld`,
        details: 'Deze wedstrijden hebben nog geen uitslag.',
      });
    }

    // 9. Check for duplicate results
    const resultCodesSet = new Set();
    const duplicateResults: string[] = [];

    for (const result of results) {
      const r = result as any;
      if (resultCodesSet.has(r.uitslag_code)) {
        duplicateResults.push(r.uitslag_code);
      }
      resultCodesSet.add(r.uitslag_code);
    }

    if (duplicateResults.length > 0) {
      for (const code of duplicateResults) {
        issues.push({
          type: 'error',
          category: 'Uitslagen',
          message: `Dubbele uitslag gevonden voor wedstrijd ${code}`,
          details: 'Er zijn meerdere uitslagen voor dezelfde wedstrijd.',
        });
      }
    }

    // 10. Check for players with missing moyenne data
    for (const player of players) {
      const p = player as any;
      const discipline = competition.discipline;

      // Map discipline to moyenne field (using period 1 moyenne for simplicity)
      const moyenneField = `spc_moyenne_${competition.periode || 1}`;

      if (!p[moyenneField] || p[moyenneField] <= 0) {
        // Construct player name from competition_players data
        const playerName = [p.spa_vnaam, p.spa_tv, p.spa_anaam].filter(Boolean).join(' ') || `Speler ${p.spc_nummer}`;

        issues.push({
          type: 'warning',
          category: 'Spelers',
          message: `${playerName} heeft geen moyenne voor deze discipline`,
          details: 'De speler heeft moyenne 0 of geen moyenne ingesteld. Dit kan leiden tot onjuiste carambolesdoelen.',
        });
      }
    }

    // Count issue types
    const errors = issues.filter((i) => i.type === 'error').length;
    const warnings = issues.filter((i) => i.type === 'warning').length;
    const info = issues.filter((i) => i.type === 'info').length;

    const report = {
      competition: {
        comp_nr: competition.comp_nr,
        comp_naam: competition.comp_naam,
      },
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      errors,
      warnings,
      info,
      issues,
      summary: {
        totalPlayers: players.length,
        totalMatches: matches.length,
        totalResults: results.length,
        checkedPlayers: players.length,
        checkedMatches: matches.length,
        checkedResults: results.length,
      },
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Error validating competition:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het valideren van de competitie.' },
      { status: 500 }
    );
  }
}
