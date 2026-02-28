import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { normalizeOrgNummer, logQueryResult } from '@/lib/orgNumberUtils';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions
 * List all tournaments for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    console.log('[TOERNOOIEN] Querying database for org:', orgNummer);
    const snapshot = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .get();

    const toernooien = snapshot.docs.map(doc => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        ...data,
        // Backward compat aliases
        comp_nr: data.t_nummer ?? data.comp_nr,
        comp_naam: data.t_naam ?? data.comp_naam,
        comp_datum: data.t_datum ?? data.comp_datum,
        punten_sys: data.t_punten_sys ?? data.punten_sys ?? 1,
      };
    });

    logQueryResult('toernooien', orgNummer, toernooien.length);
    return cachedJsonResponse(toernooien, 'default');
  } catch (error) {
    console.error('[TOERNOOIEN] Error fetching:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen toernooien.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions
 * Create a new tournament
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    const body = await request.json();

    // Validate required fields
    if (!body.t_naam || typeof body.t_naam !== 'string' || body.t_naam.trim() === '') {
      return NextResponse.json(
        { error: 'Toernooinaam is verplicht.' },
        { status: 400 }
      );
    }

    if (body.discipline === undefined || body.discipline < 1 || body.discipline > 5) {
      return NextResponse.json(
        { error: 'Ongeldige discipline.' },
        { status: 400 }
      );
    }

    // Generate next t_nummer for this organization
    const existingSnapshot = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .get();

    let maxTNummer = 0;
    existingSnapshot.docs.forEach(doc => {
      const data = doc.data() ?? {};
      const nr = data.t_nummer ?? data.comp_nr ?? 0;
      if (typeof nr === 'number' && nr > maxTNummer) {
        maxTNummer = nr;
      }
    });

    const newTNummer = maxTNummer + 1;

    const toernooiData = {
      org_nummer: orgNummer,
      gebruiker_nr: orgNummer,
      t_nummer: newTNummer,
      comp_nr: newTNummer, // routing alias
      t_naam: body.t_naam.trim(),
      comp_naam: body.t_naam.trim(), // routing alias
      t_datum: body.t_datum ?? '',
      comp_datum: body.t_datum ?? '', // routing alias
      datum_start: body.datum_start ?? '',
      datum_eind: body.datum_eind ?? '',
      discipline: Number(body.discipline),
      t_car_sys: Number(body.t_car_sys) || 1,
      t_moy_form: Number(body.t_moy_form) || 3,
      t_punten_sys: Number(body.t_punten_sys) || 1,
      punten_sys: Number(body.t_punten_sys) || 1, // routing alias
      t_min_car: Number(body.t_min_car) || 0,
      min_car: Number(body.t_min_car) || 0, // routing alias
      t_max_beurten: 0,
      max_beurten: 0, // routing alias
      t_gestart: 0,
      t_ronde: 0,
      openbaar: Number(body.openbaar) || 0,
      created_at: new Date().toISOString(),
    };

    console.log('[TOERNOOIEN] Creating:', toernooiData.t_naam);
    const docRef = await db.collection('toernooien').add(toernooiData);

    return NextResponse.json({
      success: true,
      competition: {
        id: docRef.id,
        ...toernooiData,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[TOERNOOIEN] Error creating:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken toernooi.' },
      { status: 500 }
    );
  }
}
