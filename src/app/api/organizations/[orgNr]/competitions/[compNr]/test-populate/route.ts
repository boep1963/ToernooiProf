import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateCaramboles } from '@/lib/billiards';
import { isSuperAdmin } from '@/lib/admin-shared';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

const VOORNAMEN_NL = [
  'Jan', 'Pieter', 'Henk', 'Kees', 'Willem', 'Hans', 'Peter', 'Paul', 'Mark', 'Thomas',
  'Daan', 'Lars', 'Sem', 'Levi', 'Milan', 'Bram', 'Finn', 'Jesse', 'Ruben', 'Tim',
  'Anna', 'Emma', 'Sophie', 'Julia', 'Lisa', 'Eva', 'Sara', 'Fleur', 'Iris', 'Nina',
  'Marie', 'Noa', 'Maud', 'Roos', 'Lotte', 'Evi', 'Tess', 'Saar', 'Zoë', 'Lynn',
];

const ACHTERNAMEN_NL = [
  'de Vries', 'van Dijk', 'Jansen', 'Bakker', 'Visser', 'Smit', 'de Boer', 'Mulder', 'de Groot', 'Bos',
  'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf',
  'van der Berg', 'Kok', 'Jacobs', 'de Haan', 'Vermeulen', 'van den Berg', 'van Dam', 'Koster', 'van Vliet', 'Maas',
  'Hoekstra', 'Schouten', 'Willems', 'van der Meer', 'Koning', 'Veenstra', 'Post', 'Kramer', 'van der Laan', 'Timmermans',
];

function randomNaamNl(): string {
  const v = VOORNAMEN_NL[Math.floor(Math.random() * VOORNAMEN_NL.length)];
  const a = ACHTERNAMEN_NL[Math.floor(Math.random() * ACHTERNAMEN_NL.length)];
  return `${v} ${a}`;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/test-populate
 * Alleen voor TEST_-toernooien + super admin: genereer testspelers en poule-indeling (ronde 1).
 * Start het toernooi niet; daarna kan de gebruiker normaal "Start toernooi" doen.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compDoc = compSnap.docs[0];
    const compData = compDoc.data() ?? {};

    if ((compData.t_gestart as number) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart. Testspelers alleen in voorbereiding.' }, { status: 400 });
    }

    let body: { playerCount?: number; pouleCount?: number; nameStyle?: 'test' | 'fake' } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige body. Stuur { playerCount, pouleCount, nameStyle? }.' }, { status: 400 });
    }

    const nameStyle = body.nameStyle === 'fake' ? 'fake' : 'test';

    const compNaam = String(compData.t_naam ?? compData.comp_naam ?? '').trim();
    if (!compNaam.toUpperCase().startsWith('TEST_')) {
      return NextResponse.json(
        { error: 'Alleen toernooien waarvan de naam met TEST_ begint mogen testspelers genereren.' },
        { status: 403 }
      );
    }

    const orgSnap = await db.collection('organizations').where('org_nummer', '==', orgNummer).limit(1).get();
    if (orgSnap.empty) {
      return NextResponse.json({ error: 'Organisatie niet gevonden.' }, { status: 404 });
    }
    const orgEmail = (orgSnap.docs[0].data()?.org_wl_email as string) ?? '';
    if (!isSuperAdmin(orgEmail)) {
      return NextResponse.json(
        { error: 'Alleen beheerders mogen testspelers genereren voor TEST_-toernooien.' },
        { status: 403 }
      );
    }

    const playerCount = Math.max(2, Math.min(200, Number(body.playerCount) || 0));
    const pouleCount = Math.max(1, Math.min(25, Number(body.pouleCount) || 1));
    if (playerCount < 2 * pouleCount) {
      return NextResponse.json(
        { error: 'Minimaal 2 spelers per poule. Verhoog het aantal spelers of verlaag het aantal poules.' },
        { status: 400 }
      );
    }

    const tCarSys = (compData.t_car_sys as number) ?? 1;
    const tMoyForm = (compData.t_moy_form as number) ?? 3;
    const tMinCar = (compData.t_min_car as number) ?? 0;

    const existingSpelers = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    for (const d of existingSpelers.docs) await d.ref.delete();

    const existingPoules = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    for (const d of existingPoules.docs) await d.ref.delete();

    const pouleVolgnr: Record<number, number> = {};
    for (let p = 1; p <= pouleCount; p++) pouleVolgnr[p] = 0;
    const usedFakeNames = new Set<string>();

    for (let i = 0; i < playerCount; i++) {
      const sp_nummer = i + 1;
      const sp_startmoy = Math.round((1 + Math.random() * 1.5) * 1000) / 1000;
      const sp_startcar = tCarSys === 1
        ? calculateCaramboles(sp_startmoy, tMoyForm, tMinCar)
        : Math.max(25, Math.floor(sp_startmoy * 25));
      const pouleNr = (i % pouleCount) + 1;
      pouleVolgnr[pouleNr]++;
      const sp_volgnr = pouleVolgnr[pouleNr];

      let sp_naam: string;
      if (nameStyle === 'fake') {
        let naam = randomNaamNl();
        while (usedFakeNames.has(naam)) naam = `${randomNaamNl()} ${sp_nummer}`;
        usedFakeNames.add(naam);
        sp_naam = naam;
      } else {
        sp_naam = `Test Speler ${sp_nummer}`;
      }

      await db.collection('spelers').doc(`${orgNummer}_${compNumber}_${sp_nummer}`).set({
        gebruiker_nr: orgNummer,
        t_nummer: compNumber,
        sp_nummer,
        sp_naam,
        sp_startmoy,
        sp_startcar,
        poule_nr: pouleNr,
        created_at: new Date().toISOString(),
      });

      await db.collection('poules').add({
        gebruiker_nr: orgNummer,
        t_nummer: compNumber,
        sp_nummer,
        sp_moy: sp_startmoy,
        sp_car: sp_startcar,
        sp_volgnr,
        poule_nr: pouleNr,
        ronde_nr: 1,
      });
    }

    return NextResponse.json({
      message: `${playerCount} testspelers en ${pouleCount} poule(s) aangemaakt. U kunt het toernooi nu starten via Rondenbeheer.`,
      playerCount,
      pouleCount,
    });
  } catch (error) {
    console.error('[TEST-POPULATE] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij genereren testspelers.' },
      { status: 500 }
    );
  }
}
