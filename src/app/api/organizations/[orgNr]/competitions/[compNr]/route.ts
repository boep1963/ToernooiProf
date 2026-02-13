import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr
 * Get a specific competition
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[COMPETITION] Querying database for competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('[COMPETITION] Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen competitie' },
      { status: 500 }
    );
  }
}
