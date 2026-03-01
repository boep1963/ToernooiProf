import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculate10PointScore, calculateBelgianScore, calculateWRVPoints } from '@/lib/billiards';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

type ValidationInput = {
  sp1CarGem: number;
  sp2CarGem: number;
  sp1CarTem: number;
  sp2CarTem: number;
  brt: number;
  sp1Hs: number;
  sp2Hs: number;
  maxBeurten: number;
};

function validateInvoer(input: ValidationInput): string | null {
  if (!Number.isFinite(input.brt) || input.brt <= 0) {
    return 'Beurten moet groter zijn dan 0.';
  }

  if (input.maxBeurten > 0 && input.brt > input.maxBeurten) {
    return `Beurten mag niet groter zijn dan ${input.maxBeurten}.`;
  }

  if (input.sp1CarGem < 0 || input.sp2CarGem < 0) {
    return 'Caramboles gemaakt mag niet negatief zijn.';
  }

  if (input.sp1CarGem > input.sp1CarTem || input.sp2CarGem > input.sp2CarTem) {
    return 'Caramboles gemaakt mag niet groter zijn dan caramboles te maken.';
  }

  if (input.sp1Hs < 0 || input.sp2Hs < 0) {
    return 'Hoogste serie mag niet negatief zijn.';
  }

  if (input.sp1Hs > input.sp1CarGem || input.sp2Hs > input.sp2CarGem) {
    return 'Hoogste serie mag niet groter zijn dan caramboles gemaakt.';
  }

  if ((input.sp1Hs * input.brt) < input.sp1CarGem || (input.sp2Hs * input.brt) < input.sp2CarGem) {
    return 'Combinatie van hoogste serie en beurten is ongeldig voor het aantal gemaakte caramboles.';
  }

  return null;
}

function resolveBasePuntenSystem(puntenSys: number): number {
  if (puntenSys >= 10000) {
    return Math.floor(puntenSys / 10000);
  }
  if (puntenSys % 10 === 0) {
    return Math.floor(puntenSys / 10);
  }
  return puntenSys;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/uitslagen
 * Haalt uitslagen (partijen) op voor ToernooiProf Partijbeheer.
 * Query: ronde_nr, poule_nr (beide verplicht)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);

    const { searchParams } = new URL(request.url);
    const rondeNr = searchParams.get('ronde_nr');
    const pouleNr = searchParams.get('poule_nr');

    if (!rondeNr || !pouleNr) {
      return NextResponse.json(
        { error: 'ronde_nr en poule_nr zijn verplicht' },
        { status: 400 }
      );
    }

    const ronde = parseInt(rondeNr, 10);
    const poule = parseInt(pouleNr, 10);
    if (isNaN(ronde) || isNaN(poule)) {
      return NextResponse.json({ error: 'Ongeldige ronde of poule' }, { status: 400 });
    }

    const snapshot = await db
      .collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('t_ronde', '==', ronde)
      .where('sp_poule', '==', poule)
      .orderBy('p_ronde', 'asc')
      .orderBy('koppel', 'asc')
      .get();

    const uitslagen = snapshot.docs.map((doc) => {
      const d = (doc.data() ?? {}) as Record<string, unknown>;
      return {
        id: doc.id,
        uitslag_id: Number(d.uitslag_id) || 0,
        sp_nummer_1: Number(d.sp_nummer_1) || 0,
        sp_nummer_2: Number(d.sp_nummer_2) || 0,
        sp_volgnummer_1: Number(d.sp_volgnummer_1) || 0,
        sp_volgnummer_2: Number(d.sp_volgnummer_2) || 0,
        sp1_car_tem: Number(d.sp1_car_tem) || 0,
        sp2_car_tem: Number(d.sp2_car_tem) || 0,
        sp1_car_gem: Number(d.sp1_car_gem) || 0,
        sp2_car_gem: Number(d.sp2_car_gem) || 0,
        brt: Number(d.brt) || 0,
        sp1_hs: Number(d.sp1_hs) || 0,
        sp2_hs: Number(d.sp2_hs) || 0,
        sp1_punt: Number(d.sp1_punt) || 0,
        sp2_punt: Number(d.sp2_punt) || 0,
        p_ronde: Number(d.p_ronde) || 0,
        koppel: Number(d.koppel) || 0,
        sp_partcode: String(d.sp_partcode ?? `${Number(d.p_ronde) || 0}_${Number(d.koppel) || 0}`),
        gespeeld: Number(d.gespeeld) || 0,
        tafel_nr: Number(d.tafel_nr) || 0,
      };
    });

    return NextResponse.json({ uitslagen });
  } catch (error) {
    console.error('[UITSLAGEN] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen uitslagen' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/:orgNr/competitions/:compNr/uitslagen
 * Update een uitslag (partij). Body: ronde_nr, poule_nr, sp_partcode,
 * sp1_car_gem, sp2_car_gem, brt, sp1_hs, sp2_hs, sp1_punt, sp2_punt
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }
    const body = await request.json();
    const action = body.action === 'preview' ? 'preview' : 'save';

    const { ronde_nr, poule_nr, sp_partcode } = body;
    if (ronde_nr == null || poule_nr == null || !sp_partcode) {
      return NextResponse.json(
        { error: 'ronde_nr, poule_nr en sp_partcode zijn verplicht' },
        { status: 400 }
      );
    }

    const [pRonde, koppel] = String(sp_partcode).split('_').map(Number);
    if (isNaN(pRonde) || isNaN(koppel)) {
      return NextResponse.json({ error: 'Ongeldige sp_partcode' }, { status: 400 });
    }

    const compSnap = await db
      .collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compData = compSnap.docs[0].data() ?? {};
    if (Number(compData.t_gestart ?? 0) !== 1) {
      return NextResponse.json(
        { error: 'Toernooi is nog niet gestart; uitslagen invoeren is niet toegestaan.' },
        { status: 409 }
      );
    }

    const snapshot = await db
      .collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('t_ronde', '==', Number(ronde_nr))
      .where('sp_poule', '==', Number(poule_nr))
      .where('p_ronde', '==', pRonde)
      .where('koppel', '==', koppel)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Uitslag niet gevonden' }, { status: 404 });
    }

    const uitslagDoc = snapshot.docs[0];
    const uitslagData = uitslagDoc.data() ?? {};

    const sp1CarTem = Number(uitslagData.sp1_car_tem) || 0;
    const sp2CarTem = Number(uitslagData.sp2_car_tem) || 0;
    const sp1CarGem = Math.max(Number(body.sp1_car_gem) || 0, 0);
    const sp2CarGem = Math.max(Number(body.sp2_car_gem) || 0, 0);
    const brt = Math.max(Number(body.brt) || 0, 0);
    const sp1Hs = Math.max(Number(body.sp1_hs) || 0, 0);
    const sp2Hs = Math.max(Number(body.sp2_hs) || 0, 0);

    const maxBeurten = Math.max(Number(compData.t_max_beurten ?? 0) || 0, 0);
    const validationError = validateInvoer({
      sp1CarGem,
      sp2CarGem,
      sp1CarTem,
      sp2CarTem,
      brt,
      sp1Hs,
      sp2Hs,
      maxBeurten,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const spNummer1 = Number(uitslagData.sp_nummer_1) || 0;
    const spNummer2 = Number(uitslagData.sp_nummer_2) || 0;
    const [speler1Snap, speler2Snap] = await Promise.all([
      db.collection('spelers')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('sp_nummer', '==', spNummer1)
        .limit(1)
        .get(),
      db.collection('spelers')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('sp_nummer', '==', spNummer2)
        .limit(1)
        .get(),
    ]);

    const sp1StartMoy = speler1Snap.empty ? 0 : Number(speler1Snap.docs[0].data()?.sp_startmoy) || 0;
    const sp2StartMoy = speler2Snap.empty ? 0 : Number(speler2Snap.docs[0].data()?.sp_startmoy) || 0;

    const puntenSys = Number(compData.t_punten_sys ?? compData.punten_sys ?? 1) || 1;
    const basePuntenSys = resolveBasePuntenSystem(puntenSys);
    let points1 = 0;
    let points2 = 0;

    if (basePuntenSys === 2) {
      points1 = calculate10PointScore(sp1CarGem, sp1CarTem);
      points2 = calculate10PointScore(sp2CarGem, sp2CarTem);
    } else if (basePuntenSys === 3) {
      const p = calculateBelgianScore(sp1CarGem, sp1CarTem, sp2CarGem, sp2CarTem);
      points1 = p.points1;
      points2 = p.points2;
    } else {
      const p = calculateWRVPoints(
        sp1CarGem,
        sp1CarTem,
        sp2CarGem,
        sp2CarTem,
        maxBeurten,
        brt,
        maxBeurten > 0,
        puntenSys,
        sp1StartMoy,
        sp2StartMoy
      );
      points1 = p.points1;
      points2 = p.points2;
    }

    const moy1 = brt > 0 ? Math.round((sp1CarGem / brt) * 1000) / 1000 : 0;
    const moy2 = brt > 0 ? Math.round((sp2CarGem / brt) * 1000) / 1000 : 0;

    const preview = {
      sp1_car_tem: sp1CarTem,
      sp2_car_tem: sp2CarTem,
      sp1_car_gem: sp1CarGem,
      sp2_car_gem: sp2CarGem,
      brt,
      sp1_hs: sp1Hs,
      sp2_hs: sp2Hs,
      sp1_moy: moy1,
      sp2_moy: moy2,
      sp1_punt: points1,
      sp2_punt: points2,
    };

    if (action === 'preview') {
      return NextResponse.json({ ok: true, preview });
    }

    await uitslagDoc.ref.update({
      sp1_car_gem: sp1CarGem,
      sp2_car_gem: sp2CarGem,
      brt,
      sp1_hs: sp1Hs,
      sp2_hs: sp2Hs,
      sp1_punt: points1,
      sp2_punt: points2,
      gespeeld: 1,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, saved: preview });
  } catch (error) {
    console.error('[UITSLAGEN PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken uitslag' },
      { status: 500 }
    );
  }
}
