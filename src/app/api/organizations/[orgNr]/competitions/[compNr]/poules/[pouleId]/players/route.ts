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
    const players = await getPoulePlayers(pouleId);

    if (players.length === 0) {
      return NextResponse.json({ players: [] });
    }

    // Enrich with names from members/competition_players
    const enrichedPlayers = await batchEnrichPlayerNames(orgNummer, players as any);

    return NextResponse.json({ players: enrichedPlayers });
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
