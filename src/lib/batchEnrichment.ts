/**
 * Batch Enrichment Utilities
 *
 * Optimizes Firestore reads by batch-fetching member names for players
 * instead of doing individual lookups per player.
 */

import db from '@/lib/db';
import { queryWithOrgComp } from '@/lib/firestoreUtils';

export interface PlayerToEnrich {
  id: string;
  spc_nummer: number;
  spa_vnaam?: string;
  spa_tv?: string;
  spa_anaam?: string;
  ref?: FirebaseFirestore.DocumentReference;
  [key: string]: any;
}

export interface EnrichedPlayer extends PlayerToEnrich {
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
}

/**
 * Batch enrich player names from members collection
 *
 * Instead of doing N individual Firestore lookups for N players with missing names,
 * this function:
 * 1. Collects all player numbers that need enrichment
 * 2. Fetches members in batches using 'in' queries (max 30 per batch)
 * 3. Maps member data to players in-memory
 * 4. Optionally persists enriched names back to competition_players
 *
 * @param orgNummer - Organization number
 * @param players - Array of player objects with optional document references
 * @param persistToFirestore - If true, writes enriched names back to Firestore
 * @returns Array of enriched player objects
 */
export async function batchEnrichPlayerNames(
  orgNummer: number,
  players: PlayerToEnrich[],
  persistToFirestore: boolean = false
): Promise<EnrichedPlayer[]> {
  // Find players with missing names
  const playersNeedingEnrichment = players.filter(player => {
    const hasEmptyName = !player.spa_vnaam || !player.spa_anaam;
    return hasEmptyName && player.spc_nummer;
  });

  if (playersNeedingEnrichment.length === 0) {
    console.log('[BATCH_ENRICH] No players need enrichment');
    return players.map(p => ({
      ...p,
      spa_vnaam: p.spa_vnaam || '',
      spa_tv: p.spa_tv || '',
      spa_anaam: p.spa_anaam || '',
    }));
  }

  console.log(`[BATCH_ENRICH] Enriching ${playersNeedingEnrichment.length} players out of ${players.length} total`);

  // Collect all player numbers that need enrichment
  const playerNumbers = playersNeedingEnrichment.map(p => p.spc_nummer);

  // Firestore 'in' queries have a limit of 30 items, so we need to batch
  const BATCH_SIZE = 30;
  const batches: number[][] = [];

  for (let i = 0; i < playerNumbers.length; i += BATCH_SIZE) {
    batches.push(playerNumbers.slice(i, i + BATCH_SIZE));
  }

  console.log(`[BATCH_ENRICH] Fetching members in ${batches.length} batch(es)`);

  // Fetch all members in batches
  const memberMap = new Map<number, { spa_vnaam: string; spa_tv: string; spa_anaam: string }>();

  for (const batch of batches) {
    console.log(`[BATCH_ENRICH] Fetching batch of ${batch.length} members: ${batch.join(', ')}`);

    const snapshot = await queryWithOrgComp(
      db.collection('members'),
      orgNummer,
      null,
      [{ field: 'spa_nummer', op: 'in', value: batch }],
      'spa_org'
    );

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const memberNummer = Number(data?.spa_nummer);

      if (memberNummer) {
        memberMap.set(memberNummer, {
          spa_vnaam: String(data?.spa_vnaam || ''),
          spa_tv: String(data?.spa_tv || ''),
          spa_anaam: String(data?.spa_anaam || ''),
        });
      }
    });
  }

  console.log(`[BATCH_ENRICH] Fetched ${memberMap.size} members from Firestore`);

  // Enrich players with member data
  const enrichedPlayers: EnrichedPlayer[] = [];
  const persistOperations: Promise<any>[] = [];

  for (const player of players) {
    const needsEnrichment = !player.spa_vnaam || !player.spa_anaam;

    if (needsEnrichment && player.spc_nummer) {
      const memberData = memberMap.get(player.spc_nummer);

      if (memberData) {
        // Enrich in-memory
        const enrichedPlayer = {
          ...player,
          spa_vnaam: memberData.spa_vnaam,
          spa_tv: memberData.spa_tv,
          spa_anaam: memberData.spa_anaam,
        };

        enrichedPlayers.push(enrichedPlayer);

        // Optionally persist to Firestore
        if (persistToFirestore && player.ref) {
          console.log(`[BATCH_ENRICH] Scheduling persist for player ${player.spc_nummer}`);
          persistOperations.push(
            player.ref.update({
              spa_vnaam: memberData.spa_vnaam,
              spa_tv: memberData.spa_tv,
              spa_anaam: memberData.spa_anaam,
            })
          );
        }
      } else {
        // Member not found, use empty strings
        console.warn(`[BATCH_ENRICH] Member ${player.spc_nummer} not found in members collection`);
        enrichedPlayers.push({
          ...player,
          spa_vnaam: player.spa_vnaam || '',
          spa_tv: player.spa_tv || '',
          spa_anaam: player.spa_anaam || '',
        });
      }
    } else {
      // Player already has names
      enrichedPlayers.push({
        ...player,
        spa_vnaam: player.spa_vnaam || '',
        spa_tv: player.spa_tv || '',
        spa_anaam: player.spa_anaam || '',
      });
    }
  }

  // Execute all persist operations in parallel
  if (persistOperations.length > 0) {
    console.log(`[BATCH_ENRICH] Persisting ${persistOperations.length} enriched names to Firestore...`);
    await Promise.all(persistOperations);
    console.log(`[BATCH_ENRICH] All enriched names persisted successfully`);
  }

  console.log(`[BATCH_ENRICH] Batch enrichment complete: ${enrichedPlayers.length} players enriched`);
  return enrichedPlayers;
}
