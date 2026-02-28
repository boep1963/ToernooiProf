import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { getPoules, createPoule } from '@/lib/tournamentUtils';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/poules
 * List all poules for a competition, optionally filtered by ronde_nr
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);
    
    const { searchParams } = new URL(request.url);
    const rondeNrParam = searchParams.get('ronde_nr');
    const rondeNr = rondeNrParam ? parseInt(rondeNrParam, 10) : null;

    let snapshot;
    if (rondeNr !== null) {
      snapshot = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', rondeNr)
        .orderBy('poule_nr', 'asc')
        .get();
    } else {
      snapshot = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .orderBy('ronde_nr', 'asc')
        .orderBy('poule_nr', 'asc')
        .get();
    }

    const poules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ poules });
  } catch (error) {
    console.error('[POULES] Error fetching poules:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen poules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/poules
 * Create a new poule
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);
    const body = await request.json();
    
    const { ronde_nr, poule_nr, poule_naam } = body;

    if (ronde_nr === undefined || poule_nr === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: ronde_nr, poule_nr' },
        { status: 400 }
      );
    }

    const newPoule = await createPoule(
      orgNummer,
      compNumber,
      ronde_nr,
      poule_nr,
      poule_naam || `Poule ${String.fromCharCode(64 + poule_nr)}`
    );

    return NextResponse.json(newPoule, { status: 201 });
  } catch (error) {
    console.error('[POULES] Error creating poule:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken poule' },
      { status: 500 }
    );
  }
}
