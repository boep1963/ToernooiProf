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

    const rawDocs: Array<Record<string, unknown> & { id: string }> = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...((doc.data() ?? {}) as Record<string, unknown>),
    }));

    // ToernooiProf: elk doc = één speler-in-poule. Groepeer op (ronde_nr, poule_nr) tot poules.
    const hasSpNummer = rawDocs.some((d: any) => d.sp_nummer != null);
    let poules: any[];

    if (hasSpNummer && rawDocs.length > 0) {
      const byPoule = new Map<string, any[]>();
      for (const d of rawDocs) {
        const r = Number(d.ronde_nr) || 1;
        const p = Number(d.poule_nr) || 1;
        const key = `${r}_${p}`;
        if (!byPoule.has(key)) byPoule.set(key, []);
        byPoule.get(key)!.push(d);
      }
      poules = Array.from(byPoule.entries()).map(([key, docs]) => {
        const [ronde, pouleNr] = key.split('_').map(Number);
        const first = docs[0];
        return {
          id: `rn${ronde}_pn${pouleNr}`,
          ronde_nr: ronde,
          poule_nr: pouleNr,
          poule_naam: `Poule ${pouleNr}`,
          gebruiker_nr: first.gebruiker_nr,
          t_nummer: first.t_nummer,
        };
      });
      poules.sort((a, b) => (a.ronde_nr - b.ronde_nr) || (a.poule_nr - b.poule_nr));
    } else {
      poules = rawDocs;
    }

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

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();
    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }
    const compData = compSnap.docs[0].data() ?? {};
    if ((Number(compData.t_gestart) || 0) === 0) {
      return NextResponse.json(
        { error: 'Rondebeheer is pas beschikbaar nadat het toernooi is gestart.' },
        { status: 409 }
      );
    }

    const rondeNrValue = Number(ronde_nr) || 0;
    const pouleNrValue = Number(poule_nr) || 0;
    const newPoule = await createPoule(
      orgNummer,
      compNumber,
      rondeNrValue,
      pouleNrValue,
      poule_naam || `Poule ${pouleNrValue}`
    );

    // PHP-flow equivalent: bij nieuwe ronde moet de huidige ronde in toernooi-data mee schuiven.
    const currentRound = Number(compData.t_ronde ?? 0) || 0;
    if (rondeNrValue > currentRound) {
      await compSnap.docs[0].ref.update({
        t_ronde: rondeNrValue,
        periode: rondeNrValue,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(newPoule, { status: 201 });
  } catch (error) {
    console.error('[POULES] Error creating poule:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken poule' },
      { status: 500 }
    );
  }
}
