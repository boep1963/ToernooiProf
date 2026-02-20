import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/matches/single
 * Create a single match (for dagplanning / manual match creation)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nummer_A', 'naam_A', 'cartem_A', 'nummer_B', 'naam_B', 'cartem_B', 'periode', 'uitslag_code'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Veld '${field}' is verplicht` },
          { status: 400 }
        );
      }
    }

    // Check if match already exists
    const existingMatch = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .where('uitslag_code', '==', body.uitslag_code)
      .get();

    if (!existingMatch.empty) {
      return NextResponse.json(
        { error: 'Deze wedstrijd bestaat al', match_id: existingMatch.docs[0].id },
        { status: 409 }
      );
    }

    // Create match document
    const matchData = {
      org_nummer: orgNummer,
      comp_nr: compNumber,
      nummer_A: Number(body.nummer_A),
      naam_A: String(body.naam_A),
      cartem_A: Number(body.cartem_A),
      nummer_B: Number(body.nummer_B),
      naam_B: String(body.naam_B),
      cartem_B: Number(body.cartem_B),
      periode: Number(body.periode),
      uitslag_code: String(body.uitslag_code),
      gespeeld: 0,
      tafel: body.tafel || '000000000000',
    };

    const docRef = await db.collection('matches').add(matchData);
    console.log(`[MATCHES] Created single match: ${docRef.id} - ${body.naam_A} vs ${body.naam_B}`);

    return NextResponse.json({
      id: docRef.id,
      ...matchData,
      message: 'Wedstrijd aangemaakt',
    }, { status: 201 });
  } catch (error) {
    console.error('[MATCHES] Error creating single match:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken wedstrijd', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
