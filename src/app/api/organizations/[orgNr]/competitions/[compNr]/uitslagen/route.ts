import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
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
      const d = doc.data();
      return {
        id: doc.id,
        uitslag_id: d.uitslag_id,
        sp_nummer_1: d.sp_nummer_1,
        sp_nummer_2: d.sp_nummer_2,
        sp_volgnummer_1: d.sp_volgnummer_1,
        sp_volgnummer_2: d.sp_volgnummer_2,
        sp1_car_tem: d.sp1_car_tem ?? 0,
        sp2_car_tem: d.sp2_car_tem ?? 0,
        sp1_car_gem: d.sp1_car_gem ?? 0,
        sp2_car_gem: d.sp2_car_gem ?? 0,
        brt: d.brt ?? 0,
        sp1_hs: d.sp1_hs ?? 0,
        sp2_hs: d.sp2_hs ?? 0,
        sp1_punt: d.sp1_punt ?? 0,
        sp2_punt: d.sp2_punt ?? 0,
        p_ronde: d.p_ronde,
        koppel: d.koppel,
        sp_partcode: d.sp_partcode ?? `${d.p_ronde}_${d.koppel}`,
        gespeeld: d.gespeeld ?? 0,
        tafel_nr: d.tafel_nr ?? 0,
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
    const body = await request.json();

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

    const docRef = snapshot.docs[0].ref;
    const updateData: Record<string, unknown> = {};
    if (body.sp1_car_gem !== undefined) updateData.sp1_car_gem = Number(body.sp1_car_gem);
    if (body.sp2_car_gem !== undefined) updateData.sp2_car_gem = Number(body.sp2_car_gem);
    if (body.brt !== undefined) updateData.brt = Number(body.brt);
    if (body.sp1_hs !== undefined) updateData.sp1_hs = Number(body.sp1_hs);
    if (body.sp2_hs !== undefined) updateData.sp2_hs = Number(body.sp2_hs);
    if (body.sp1_punt !== undefined) updateData.sp1_punt = Number(body.sp1_punt);
    if (body.sp2_punt !== undefined) updateData.sp2_punt = Number(body.sp2_punt);
    updateData.gespeeld = 1;

    await docRef.update(updateData);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[UITSLAGEN PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken uitslag' },
      { status: 500 }
    );
  }
}
