#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

(async () => {
  try {
    console.log('Checking results for org 1000...');

    const resultsSnapshot = await db.collection('ClubMatch/data/results')
      .where('org_nummer', '==', 1000)
      .limit(10)
      .get();

    console.log(`Found ${resultsSnapshot.size} results (showing first 10)`);

    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nResult ID: ${doc.id}`);
      console.log(`  Competition: ${data.comp_nr}`);
      console.log(`  Code: ${data.uitslag_code}`);
      console.log(`  Player 1: ${data.sp_1_nr} - Name: ${data.sp_1_naam || 'MISSING'}`);
      console.log(`  Player 2: ${data.sp_2_nr} - Name: ${data.sp_2_naam || 'MISSING'}`);
      console.log(`  Date: ${data.speeldatum}`);
    });

    // Count total results for org 1000
    const allResults = await db.collection('ClubMatch/data/results')
      .where('org_nummer', '==', 1000)
      .get();

    console.log(`\nTotal results for org 1000: ${allResults.size}`);

    const withNames = allResults.docs.filter(doc => doc.data().sp_1_naam && doc.data().sp_2_naam);
    const withoutNames = allResults.docs.filter(doc => !doc.data().sp_1_naam || !doc.data().sp_2_naam);

    console.log(`Results with both names: ${withNames.length}`);
    console.log(`Results missing names: ${withoutNames.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
})();
