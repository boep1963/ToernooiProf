import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { getPoulePlayers, addPlayerToPoule } from '@/lib/tournamentUtils';
import { batchEnrichPlayerNames } from '@/lib/batchEnrichment';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; pouleId: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/poules/:pouleId/players
 * List all players in a poule
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, pouleId } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);
    let players: any[] = await getPoulePlayers(pouleId);

    // Fallback: ToernooiProf gebruikt poules-collectie (tp_poules) - elke doc = één speler in poule
    if (players.length === 0) {
      const match = pouleId.match(/^rn(\d+)_pn(\d+)$/);
      if (match) {
        const rondeNr = parseInt(match[1], 10);
        const pouleNr = parseInt(match[2], 10);
        const poulesSnap = await db.collection('poules')
          .where('gebruiker_nr', '==', orgNummer)
          .where('t_nummer', '==', compNumber)
          .where('ronde_nr', '==', rondeNr)
          .where('poule_nr', '==', pouleNr)
          .get();

        const spNummers = poulesSnap.docs.map(d => Number(d.data()?.sp_nummer)).filter(Boolean);
        let spelerMap = new Map<number, string>();
        if (spNummers.length > 0) {
          const spelersSnap = await db.collection('spelers')
            .where('gebruiker_nr', '==', orgNummer)
            .where('t_nummer', '==', compNumber)
            .get();
          spelersSnap.docs.forEach(d => {
            const d_ = (d.data() ?? {}) as Record<string, unknown>;
            const nr = Number(d_.sp_nummer) || 0;
            if (nr > 0) spelerMap.set(nr, String(d_.sp_naam ?? `Speler ${nr}`));
          });
        }

        const mapped = poulesSnap.docs.map(doc => {
          const u = (doc.data() ?? {}) as Record<string, unknown>;
          const spNr = Number(u.sp_nummer) || 0;
          return {
            id: doc.id,
            spc_nummer: spNr,
            moyenne_start: Number(u.sp_moy) || 0,
            caramboles_start: Number(u.sp_car) || 0,
            naam: spelerMap.get(spNr) || `Speler ${spNr}`,
            sp_volgnr: Number(u.sp_volgnr) || 0,
          };
        });
        mapped.sort((a: any, b: any) => a.sp_volgnr - b.sp_volgnr);
        players = mapped;
      }
    }

    if (players.length === 0) {
      return NextResponse.json({ players: [] });
    }

    // Enrich with names from members/competition_players (ClubMatch)
    const enrichedPlayers = players.every((p: any) => p.naam)
      ? players
      : await batchEnrichPlayerNames(orgNummer, players as any);

    return NextResponse.json({
      players: enrichedPlayers.map((p: any) => ({
        ...p,
        naam: p.naam ?? (p.spa_vnaam && p.spa_anaam ? `${p.spa_vnaam} ${(p.spa_tv || '')} ${p.spa_anaam}`.trim() : `Speler ${p.spc_nummer}`),
      })),
    });
  } catch (error) {
    console.error('[POULE_PLAYERS] Error fetching players:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen poulespelers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/poules/:pouleId/players
 * Add a player to a poule
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, pouleId } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const orgNummer = authResult.orgNummer;
    const compNumber = parseInt(compNr, 10);
    const body = await request.json();
    
    const { spc_nummer, ronde_nr, moyenne_start, caramboles_start } = body;

    if (!spc_nummer || ronde_nr === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: spc_nummer, ronde_nr' },
        { status: 400 }
      );
    }

    const newPlayer = await addPlayerToPoule(
      orgNummer,
      compNumber,
      ronde_nr,
      pouleId,
      spc_nummer,
      moyenne_start || 0,
      caramboles_start || 0
    );

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('[POULE_PLAYERS] Error adding player:', error);
    return NextResponse.json(
      { error: 'Fout bij toevoegen speler aan poule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/poules/:pouleId/players
 * Remove all players from a poule
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, pouleId } = await params;
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;

    const snapshot = await db.collection('poule_players')
      .where('poule_id', '==', pouleId)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    return NextResponse.json({ message: 'Alle spelers verwijderd uit poule' });
  } catch (error) {
    console.error('[POULE_PLAYERS] Error deleting players:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen spelers uit poule' },
      { status: 500 }
    );
  }
}
