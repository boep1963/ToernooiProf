import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { normalizeOrgNummer, logQueryResult } from '@/lib/orgNumberUtils';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions
 * List all competitions for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    console.log('[COMPETITIONS] Querying database for competitions of org:', orgNummer);
    const snapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .get();

    const competitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    logQueryResult('competitions', orgNummer, competitions.length);
    console.log(`[COMPETITIONS] Found ${competitions.length} competitions`);
    return NextResponse.json(competitions);
  } catch (error) {
    console.error('[COMPETITIONS] Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen competities.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions
 * Create a new competition
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = normalizeOrgNummer(authResult.orgNummer);

    const body = await request.json();

    // Validate required fields
    if (!body.comp_naam || typeof body.comp_naam !== 'string' || body.comp_naam.trim() === '') {
      return NextResponse.json(
        { error: 'Competitienaam is verplicht.' },
        { status: 400 }
      );
    }

    if (!body.comp_datum) {
      return NextResponse.json(
        { error: 'Datum is verplicht.' },
        { status: 400 }
      );
    }

    if (!body.discipline || body.discipline < 1 || body.discipline > 5) {
      return NextResponse.json(
        { error: 'Ongeldige discipline.' },
        { status: 400 }
      );
    }

    // Generate next competition number for this organization
    console.log('[COMPETITIONS] Generating next comp_nr for org:', orgNummer);
    const existingSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .get();

    let maxCompNr = 0;
    existingSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data && typeof data.comp_nr === 'number' && data.comp_nr > maxCompNr) {
        maxCompNr = data.comp_nr;
      }
    });

    const newCompNr = maxCompNr + 1;

    const competitionData = {
      org_nummer: orgNummer,
      comp_nr: newCompNr,
      comp_naam: body.comp_naam.trim(),
      comp_datum: body.comp_datum,
      discipline: Number(body.discipline),
      periode: Number(body.periode) || 1,
      punten_sys: Number(body.punten_sys) || 1,
      moy_form: Number(body.moy_form) || 3,
      min_car: Number(body.min_car) || 10,
      max_beurten: Number(body.max_beurten) || 30,
      vast_beurten: Number(body.vast_beurten) || 0,
      sorteren: Number(body.sorteren) || 1,
    };

    console.log('[COMPETITIONS] Creating new competition in database:', competitionData.comp_naam);
    const docRef = await db.collection('competitions').add(competitionData);

    console.log('[COMPETITIONS] Competition created successfully, comp_nr:', newCompNr);
    return NextResponse.json({
      success: true,
      competition: {
        id: docRef.id,
        ...competitionData,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[COMPETITIONS] Error creating competition:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken competitie.' },
      { status: 500 }
    );
  }
}
