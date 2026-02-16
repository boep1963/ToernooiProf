#!/usr/bin/env node
/**
 * Create results WITHOUT player names to test denormalization performance
 * This simulates the scenario where old results need lazy denormalization
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createResultsForDenormTest() {
  try {
    const orgNummer = 1205;
    const compNr = 3;

    console.log('\n=== Creating results WITHOUT player names for denormalization test ===\n');

    // Delete existing sp_1_naam and sp_2_naam fields from all results in competition 1
    const resultsSnapshot = await db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNr)
      .get();

    console.log(`Found ${resultsSnapshot.size} results in competition ${compNr}`);

    if (resultsSnapshot.empty) {
      console.log('No results found. Creating test results...');

      // Get players from competition_players
      const playersSnapshot = await db.collection('competition_players')
        .where('spc_org', '==', orgNummer)
        .where('spc_competitie', '==', compNr)
        .get();

      const players = playersSnapshot.docs.map(doc => doc.data().spc_nummer);
      console.log(`Found ${players.length} players:`, players);

      if (players.length < 2) {
        console.error('Need at least 2 players to create results');
        process.exit(1);
      }

      // Create 20 test results without player names
      const batch = db.batch();
      for (let i = 0; i < 20; i++) {
        const p1 = players[i % players.length];
        const p2 = players[(i + 1) % players.length];

        const docRef = db.collection('results').doc();
        batch.set(docRef, {
          org_nummer: orgNummer,
          comp_nr: compNr,
          uitslag_code: `${orgNummer}_${compNr}_${p1}_${p2}_${i + 1}`,
          periode: 1,
          sp_1_nr: p1,
          sp_1_cartem: 25,
          sp_1_cargem: 20 + (i % 10),
          sp_1_hs: 5,
          sp_1_punt: 2,
          sp_2_nr: p2,
          sp_2_cartem: 25,
          sp_2_cargem: 15 + (i % 8),
          sp_2_hs: 4,
          sp_2_punt: 0,
          brt: 15,
          gespeeld: 1,
          speeldatum: `14-02-2026`
          // NOTE: Intentionally omitting sp_1_naam and sp_2_naam
        });
      }

      await batch.commit();
      console.log('✅ Created 20 test results WITHOUT player names');
    } else {
      // Remove sp_1_naam and sp_2_naam from existing results
      console.log('Removing player names from existing results...');

      const batch = db.batch();
      let count = 0;

      for (const doc of resultsSnapshot.docs) {
        const data = doc.data();
        if (data.sp_1_naam || data.sp_2_naam) {
          batch.update(doc.ref, {
            sp_1_naam: admin.firestore.FieldValue.delete(),
            sp_2_naam: admin.firestore.FieldValue.delete()
          });
          count++;
        }

        if (count >= 500) {
          await batch.commit();
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      console.log(`✅ Removed player names from ${resultsSnapshot.size} results`);
    }

    console.log('\n✅ Test scenario ready!');
    console.log('   - Navigate to: http://localhost:3000/competities/1/uitslagen/overzicht');
    console.log('   - The first load will trigger denormalization');
    console.log('   - Check server logs for "[RESULTS] Batch fetching N members" message\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

createResultsForDenormTest();
