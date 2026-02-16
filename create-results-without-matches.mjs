#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createResultsWithoutMatches() {
  try {
    const orgNummer = 1205;
    const compNr = 3;

    // Check if matches exist
    const matchesSnapshot = await db
      .collection('ClubMatch/data/matches')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNr)
      .get();

    console.log(`Matches found for comp ${compNr}:`, matchesSnapshot.size);

    // Delete all matches if they exist
    if (!matchesSnapshot.empty) {
      const batch = db.batch();
      matchesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Deleted all matches');
    }

    // Check if results exist
    const resultsSnapshot = await db
      .collection('ClubMatch/data/results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNr)
      .get();

    console.log(`Results found for comp ${compNr}:`, resultsSnapshot.size);

    // If no results, create some test results
    if (resultsSnapshot.empty) {
      const testResults = [
        {
          org_nummer: orgNummer,
          comp_nr: compNr,
          uitslag_code: `${orgNummer}_${compNr}_1_2_1`,
          sp_1_nr: 1,
          sp_1_cartem: 25,
          sp_1_cargem: 27,
          sp_1_hs: 5,
          sp_1_punt: 2,
          sp_2_nr: 2,
          sp_2_cartem: 25,
          sp_2_cargem: 20,
          sp_2_hs: 4,
          sp_2_punt: 0,
          brt: 15,
          gespeeld: 1,
          speeldatum: '14-02-2026 10:30'
        },
        {
          org_nummer: orgNummer,
          comp_nr: compNr,
          uitslag_code: `${orgNummer}_${compNr}_3_4_1`,
          sp_1_nr: 3,
          sp_1_cartem: 25,
          sp_1_cargem: 25,
          sp_1_hs: 6,
          sp_1_punt: 2,
          sp_2_nr: 4,
          sp_2_cartem: 25,
          sp_2_cargem: 22,
          sp_2_hs: 5,
          sp_2_punt: 0,
          brt: 18,
          gespeeld: 1,
          speeldatum: '14-02-2026 11:00'
        }
      ];

      const batch = db.batch();
      testResults.forEach(result => {
        const docRef = db.collection('ClubMatch/data/results').doc();
        batch.set(docRef, result);
      });
      await batch.commit();
      console.log(`Created ${testResults.length} test results`);
    }

    console.log('\nScenario created: Competition 3 has results but no matches');
    console.log('You can now test at: http://localhost:3006/competities/3/uitslagen');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createResultsWithoutMatches();
