import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { isSuperAdmin } from '@/lib/admin-shared';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/uitslagen/test-generate
 * Alleen voor TEST_-toernooien + super admin: vul alle nog niet gespeelde uitslagen
 * van de opgegeven ronde (en optioneel poule) met gegenereerde resultaten (gespeeld=1).
 * Body: { ronde_nr, poule_nr? } – poule_nr optioneel; zonder = alle poules van die ronde.
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

    let body: { ronde_nr?: number; poule_nr?: number } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body: { ronde_nr, poule_nr? } verplicht.' }, { status: 400 });
    }
    const rondeNr = Number(body.ronde_nr) || 0;
    if (rondeNr < 1) {
      return NextResponse.json({ error: 'ronde_nr moet >= 1 zijn.' }, { status: 400 });
    }

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();
    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }
    const compData = compSnap.docs[0].data() ?? {};
    const compNaam = String(compData.t_naam ?? compData.comp_naam ?? '').trim();
    if (!compNaam.toUpperCase().startsWith('TEST_')) {
      return NextResponse.json(
        { error: 'Alleen toernooien waarvan de naam met TEST_ begint mogen testuitslagen genereren.' },
        { status: 403 }
      );
    }

    const orgDocSnap = await db.collection('organizations').where('org_nummer', '==', orgNummer).limit(1).get();
    if (orgDocSnap.empty) {
      return NextResponse.json({ error: 'Organisatie niet gevonden.' }, { status: 404 });
    }
    const orgEmail = (orgDocSnap.docs[0].data()?.org_wl_email as string) ?? '';
    if (!isSuperAdmin(orgEmail)) {
      return NextResponse.json(
        { error: 'Alleen beheerders mogen testuitslagen genereren voor TEST_-toernooien.' },
        { status: 403 }
      );
    }

    if (Number(compData.t_gestart) !== 1) {
      return NextResponse.json(
        { error: 'Toernooi moet eerst gestart zijn om uitslagen te genereren.' },
        { status: 400 }
      );
    }

    let snapshot;
    if (body.poule_nr != null && body.poule_nr > 0) {
      snapshot = await db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('t_ronde', '==', rondeNr)
        .where('sp_poule', '==', Number(body.poule_nr))
        .get();
    } else {
      snapshot = await db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('t_ronde', '==', rondeNr)
        .get();
    }

    let updated = 0;
    for (const doc of snapshot.docs) {
      const u = doc.data() ?? {};
      if (Number(u.gespeeld) === 1) continue;

      const sp1_tem = Number(u.sp1_car_tem) || 50;
      const sp2_tem = Number(u.sp2_car_tem) || 50;
      const brt = 40 + Math.floor(Math.random() * 30);
      let sp1_gem = Math.floor(Math.random() * Math.min(sp1_tem, brt));
      let sp2_gem = Math.floor(Math.random() * Math.min(sp2_tem, brt));
      sp1_gem = Math.min(sp1_gem, sp1_tem);
      sp2_gem = Math.min(sp2_gem, sp2_tem);
      const sp1_hs = Math.min(2 + Math.floor(Math.random() * 7), sp1_gem || 1);
      const sp2_hs = Math.min(2 + Math.floor(Math.random() * 7), sp2_gem || 1);
      const per1 = sp1_tem > 0 ? (sp1_gem / sp1_tem) * 100 : 0;
      const per2 = sp2_tem > 0 ? (sp2_gem / sp2_tem) * 100 : 0;
      let sp1_punt: number;
      let sp2_punt: number;
      if (per1 > per2) {
        sp1_punt = 2;
        sp2_punt = 0;
      } else if (per2 > per1) {
        sp1_punt = 0;
        sp2_punt = 2;
      } else {
        sp1_punt = 1;
        sp2_punt = 1;
      }

      await doc.ref.update({
        sp1_car_gem: sp1_gem,
        sp2_car_gem: sp2_gem,
        brt,
        sp1_hs,
        sp2_hs,
        sp1_punt,
        sp2_punt,
        gespeeld: 1,
        updated_at: new Date().toISOString(),
      });
      updated++;
    }

    return NextResponse.json({
      message: `${updated} uitslag(en) gegenereerd.`,
      updated,
    });
  } catch (error) {
    console.error('[UITSLAGEN TEST-GENERATE] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij genereren testuitslagen.' },
      { status: 500 }
    );
  }
}
