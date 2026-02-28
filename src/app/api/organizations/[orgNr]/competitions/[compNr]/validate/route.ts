import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
}

/**
 * Validate ToernooiProf tournament data.
 * Uses: toernooien, spelers, uitslagen
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgNr: string; compNr: string }> }
) {
  try {
    const { orgNr, compNr } = await context.params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const org_nummer = authResult.orgNummer;

    const comp_nr = parseInt(compNr, 10);
    if (isNaN(comp_nr)) {
      return NextResponse.json(
        { error: 'Ongeldig toernooi nummer.' },
        { status: 400 }
      );
    }

    const issues: ValidationIssue[] = [];

    // 1. Get toernooi (ToernooiProf: org_nummer of gebruiker_nr)
    let toernooiSnapshot = await db
      .collection('toernooien')
      .where('org_nummer', '==', org_nummer)
      .where('t_nummer', '==', comp_nr)
      .limit(1)
      .get();

    if (toernooiSnapshot.empty) {
      toernooiSnapshot = await db
        .collection('toernooien')
        .where('gebruiker_nr', '==', org_nummer)
        .where('t_nummer', '==', comp_nr)
        .limit(1)
        .get();
    }

    if (toernooiSnapshot.empty) {
      return NextResponse.json(
        { error: 'Toernooi niet gevonden.' },
        { status: 404 }
      );
    }

    const compDoc = toernooiSnapshot.docs[0];
    const competition = compDoc.data() as Record<string, unknown>;

    const compNaam = (competition.t_naam ?? competition.comp_naam ?? '') as string;
    const periode = (competition.t_ronde ?? competition.periode ?? 1) as number;

    // 2. Get spelers (ToernooiProf: gebruiker_nr + t_nummer)
    const spelersSnapshot = await db
      .collection('spelers')
      .where('gebruiker_nr', '==', org_nummer)
      .where('t_nummer', '==', comp_nr)
      .get();

    const players = spelersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const playerIds = players.map((p: { sp_nummer?: number }) => p.sp_nummer).filter(Boolean);

    if (playerIds.length === 0) {
      issues.push({
        type: 'warning',
        category: 'Spelers',
        message: 'Geen spelers toegevoegd aan dit toernooi',
        details: 'Voeg spelers toe om wedstrijden te kunnen plannen.',
      });
    }

    // 3. Get uitslagen (ToernooiProf: partijen + resultaten, gebruiker_nr + t_nummer)
    const uitslagenSnapshot = await db
      .collection('uitslagen')
      .where('gebruiker_nr', '==', org_nummer)
      .where('t_nummer', '==', comp_nr)
      .get();

    const uitslagen = uitslagenSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const gespeeldUitslagen = uitslagen.filter((u: { gespeeld?: number }) => (u.gespeeld ?? 0) === 1);

    // 4. Validate uitslagen: spelers bestaan, geen speler tegen zichzelf
    for (const u of uitslagen) {
      const uDoc = u as { sp_nummer_1?: number; sp_nummer_2?: number; sp_partcode?: string };
      const sp1 = uDoc.sp_nummer_1;
      const sp2 = uDoc.sp_nummer_2;
      const code = uDoc.sp_partcode ?? 'onbekend';

      if (sp1 != null && !playerIds.includes(sp1)) {
        issues.push({
          type: 'error',
          category: 'Partijen',
          message: `Partij ${code} verwijst naar onbekende speler ${sp1}`,
          details: 'Deze speler is niet toegevoegd aan het toernooi.',
        });
      }
      if (sp2 != null && !playerIds.includes(sp2)) {
        issues.push({
          type: 'error',
          category: 'Partijen',
          message: `Partij ${code} verwijst naar onbekende speler ${sp2}`,
          details: 'Deze speler is niet toegevoegd aan het toernooi.',
        });
      }
      if (sp1 === sp2 && sp1 != null) {
        issues.push({
          type: 'error',
          category: 'Partijen',
          message: `Partij ${code} heeft dezelfde speler aan beide kanten`,
          details: `Speler ${sp1} kan niet tegen zichzelf spelen.`,
        });
      }
    }

    // 5. Validate gespeelde uitslagen: caramboles, beurten, punten
    for (const r of gespeeldUitslagen) {
      const ru = r as {
        sp1_car_gem?: number;
        sp2_car_gem?: number;
        brt?: number;
        sp1_punt?: number;
        sp2_punt?: number;
        sp_partcode?: string;
      };
      const car1 = ru.sp1_car_gem ?? 0;
      const car2 = ru.sp2_car_gem ?? 0;
      const brt = ru.brt ?? 0;
      const code = ru.sp_partcode ?? 'onbekend';

      if (car1 < 0 || car2 < 0) {
        issues.push({
          type: 'error',
          category: 'Uitslagen',
          message: `Uitslag ${code} heeft negatieve caramboles`,
          details: 'Caramboles kunnen niet negatief zijn.',
        });
      }
      if (brt <= 0) {
        issues.push({
          type: 'error',
          category: 'Uitslagen',
          message: `Uitslag ${code} heeft ongeldige beurten (${brt})`,
          details: 'Het aantal beurten moet groter dan 0 zijn.',
        });
      }

      const puntenSys = (competition.t_punten_sys ?? competition.punten_sys ?? 1) as number;
      const p1 = ru.sp1_punt ?? 0;
      const p2 = ru.sp2_punt ?? 0;
      if ((p1 < 0 || p2 < 0) && puntenSys !== 2) {
        issues.push({
          type: 'warning',
          category: 'Uitslagen',
          message: `Uitslag ${code} heeft negatieve punten`,
          details: 'Controleer of de puntentelling correct is.',
        });
      }
    }

    // 6. Dubbele uitslagen:zelfde (t_ronde + sp_poule + sp_partcode) in meerdere docs.
    // NB: sp_partcode is uniek per poule per ronde – ronde 2 poule 1 "1_1" is een andere partij dan ronde 1 poule 1 "1_1".
    const codesSeen = new Set<string>();
    const duplicates: string[] = [];
    for (const u of uitslagen) {
      const tRonde = (u as { t_ronde?: number }).t_ronde ?? 1;
      const poule = (u as { sp_poule?: number }).sp_poule ?? 0;
      const code = (u as { sp_partcode?: string }).sp_partcode ?? '';
      const uniqueKey = `${tRonde}_${poule}_${code}`;
      if (code) {
        if (codesSeen.has(uniqueKey)) duplicates.push(uniqueKey);
        else codesSeen.add(uniqueKey);
      }
    }
    for (const key of duplicates) {
      issues.push({
        type: 'error',
        category: 'Uitslagen',
        message: `Dubbele uitslag gevonden voor partij (poule + code: ${key})`,
        details: 'Er zijn meerdere uitslagen voor dezelfde wedstrijd in dezelfde poule.',
      });
    }

    // 7. Info: nog niet gespeelde partijen
    const nietGespeeld = uitslagen.filter((u: { gespeeld?: number }) => (u.gespeeld ?? 0) !== 1);
    if (nietGespeeld.length > 0) {
      issues.push({
        type: 'info',
        category: 'Uitslagen',
        message: `${nietGespeeld.length} partij(en) nog niet gespeeld`,
        details: 'Deze partijen hebben nog geen uitslag.',
      });
    }

    // 8. Spelers zonder naam
    for (const p of players) {
      const sp = p as { sp_naam?: string; sp_nummer?: number };
      if (!sp.sp_naam || String(sp.sp_naam).trim() === '') {
        issues.push({
          type: 'warning',
          category: 'Spelers',
          message: `Speler ${sp.sp_nummer ?? 'onbekend'} heeft geen naam`,
          details: 'Vul de spelernaam in.',
        });
      }
    }

    const errors = issues.filter((i) => i.type === 'error').length;
    const warnings = issues.filter((i) => i.type === 'warning').length;
    const info = issues.filter((i) => i.type === 'info').length;

    const report = {
      tournament: {
        comp_nr,
        comp_naam: compNaam,
        periode,
      },
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      errors,
      warnings,
      info,
      issues,
      summary: {
        totalPlayers: players.length,
        totalMatches: uitslagen.length,
        totalResults: gespeeldUitslagen.length,
        checkedPlayers: players.length,
        checkedMatches: uitslagen.length,
        checkedResults: gespeeldUitslagen.length,
      },
    };

    return cachedJsonResponse(report, 'short', 200);
  } catch (error) {
    console.error('[VALIDATE] Error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het valideren van het toernooi.' },
      { status: 500 }
    );
  }
}
