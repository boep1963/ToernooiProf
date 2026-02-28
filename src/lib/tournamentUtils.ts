import db from './db';
import { Poule, PoulePlayer } from '@/types/tournament';
import { queryWithOrgComp } from './firestoreUtils';

/**
 * Get all poules for a specific round in a tournament
 */
export async function getPoules(orgNr: number, compNr: number, rondeNr: number): Promise<Poule[]> {
  const snapshot = await db.collection('poules')
    .where('org_nummer', '==', orgNr)
    .where('comp_nr', '==', compNr)
    .where('ronde_nr', '==', rondeNr)
    .orderBy('poule_nr', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Poule));
}

/**
 * Get all players assigned to a specific poule
 */
export async function getPoulePlayers(pouleId: string): Promise<PoulePlayer[]> {
  const snapshot = await db.collection('poule_players')
    .where('poule_id', '==', pouleId)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PoulePlayer));
}

/**
 * Create a new poule for a round
 */
export async function createPoule(
  orgNr: number,
  compNr: number,
  rondeNr: number,
  pouleNr: number,
  pouleNaam: string
): Promise<Poule> {
  const pouleData = {
    org_nummer: orgNr,
    comp_nr: compNr,
    ronde_nr: rondeNr,
    poule_nr: pouleNr,
    poule_naam: pouleNaam,
    created_at: new Date().toISOString()
  };

  const docRef = await db.collection('poules').add(pouleData);
  return { id: docRef.id, ...pouleData };
}

/**
 * Add a player to a specific poule
 */
export async function addPlayerToPoule(
  orgNr: number,
  compNr: number,
  rondeNr: number,
  pouleId: string,
  spcNummer: number,
  moyenne: number,
  caramboles: number
): Promise<PoulePlayer> {
  const playerData = {
    org_nummer: orgNr,
    comp_nr: compNr,
    ronde_nr: rondeNr,
    poule_id: pouleId,
    spc_nummer: spcNummer,
    moyenne_start: moyenne,
    caramboles_start: caramboles
  };

  const docRef = await db.collection('poule_players').add(playerData);
  return { id: docRef.id, ...playerData };
}

/**
 * Get all rounds for a tournament based on existing poules
 */
export async function getTournamentRounds(orgNr: number, compNr: number): Promise<number[]> {
  const snapshot = await db.collection('poules')
    .where('org_nummer', '==', orgNr)
    .where('comp_nr', '==', compNr)
    .get();

  const rounds = new Set<number>();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data && typeof data.ronde_nr === 'number') {
      rounds.add(data.ronde_nr);
    }
  });

  return Array.from(rounds).sort((a, b) => a - b);
}
