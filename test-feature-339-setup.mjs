#!/usr/bin/env node

/**
 * Feature #339 Test Setup Script
 * Creates a competition with vast_beurten=1 and a test result
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/serviceAccountKey.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function setupFeature339Test() {
  const orgNummer = 1205;

  try {
    // Check if competition with vast_beurten=1 exists
    const compsRef = db.collection('organizations').doc(String(orgNummer)).collection('competitions');
    const compsSnapshot = await compsRef
      .where('vast_beurten', '==', 1)
      .limit(1)
      .get();

    let compNr;
    let maxBeurten;

    if (!compsSnapshot.empty) {
      const comp = compsSnapshot.docs[0].data();
      compNr = comp.comp_nr;
      maxBeurten = comp.max_beurten;
      console.log(`Found competition #${compNr} with vast_beurten=1, max_beurten=${maxBeurten}`);
    } else {
      console.log('No competition with vast_beurten found. Please create one manually.');
      console.log('Use: vast_beurten=1, max_beurten=30');
      process.exit(1);
    }

    // Get players from this competition
    const playersRef = compsRef.doc(String(compNr)).collection('players');
    const playersSnapshot = await playersRef.limit(2).get();

    if (playersSnapshot.size < 2) {
      console.log('Not enough players in competition. Need at least 2 players.');
      process.exit(1);
    }

    const players = playersSnapshot.docs.map(doc => doc.data());
    console.log(`Found ${players.length} players`);

    // Check if result exists between first two players
    const resultsRef = compsRef.doc(String(compNr)).collection('results');
    const resultSnapshot = await resultsRef
      .where('sp_1_nr', '==', players[0].spc_nummer)
      .where('sp_2_nr', '==', players[1].spc_nummer)
      .limit(1)
      .get();

    if (!resultSnapshot.empty) {
      const result = resultSnapshot.docs[0].data();
      console.log('\n✅ Test scenario ready!');
      console.log(`Competition: #${compNr}`);
      console.log(`max_beurten: ${maxBeurten}`);
      console.log(`vast_beurten: 1`);
      console.log(`Result exists between players ${players[0].spc_nummer} and ${players[1].spc_nummer}`);
      console.log(`Current beurten in result: ${result.brt || 'N/A'}`);
      console.log(`\nTo test Feature #339:`);
      console.log(`1. Go to: http://localhost:3007/competities/${compNr}/matrix`);
      console.log(`2. Click on the result cell for players ${players[0].spc_nummer} vs ${players[1].spc_nummer}`);
      console.log(`3. Change beurten from ${result.brt || maxBeurten} to a different value (e.g., ${maxBeurten - 5})`);
      console.log(`4. Click "Controle"`);
      console.log(`5. Verify warning modal appears`);
    } else {
      console.log('\nNo result found between first two players.');
      console.log(`Please create a result in competition #${compNr} via the Matrix page.`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupFeature339Test();
