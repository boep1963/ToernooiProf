#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

(async () => {
  try {
    console.log('Checking data for org 1000, competition 2...\n');

    // Check matches
    const matchesSnapshot = await db.collection('ClubMatch/data/matches')
      .where('org_nummer', '==', 1000)
      .where('comp_nr', '==', 2)
      .limit(10)
      .get();

    console.log(`Matches found: ${matchesSnapshot.size}`);
    if (matchesSnapshot.size > 0) {
      const match = matchesSnapshot.docs[0].data();
      console.log('Sample match:', {
        uitslag_code: match.uitslag_code,
        nummer_A: match.nummer_A,
        nummer_B: match.nummer_B,
        gespeeld: match.gespeeld,
        periode: match.periode
      });
    }

    // Check results
    const resultsSnapshot = await db.collection('ClubMatch/data/results')
      .where('org_nummer', '==', 1000)
      .where('comp_nr', '==', 2)
      .limit(10)
      .get();

    console.log(`\nResults found: ${resultsSnapshot.size}`);
    if (resultsSnapshot.size > 0) {
      const result = resultsSnapshot.docs[0].data();
      console.log('Sample result:', {
        uitslag_code: result.uitslag_code,
        sp_1_nr: result.sp_1_nr,
        sp_1_naam: result.sp_1_naam || 'NOT SET',
        sp_2_nr: result.sp_2_nr,
        sp_2_naam: result.sp_2_naam || 'NOT SET',
        periode: result.periode,
        sp_1_punt: result.sp_1_punt,
        sp_2_punt: result.sp_2_punt
      });
    }

    // Check competition_players
    const playersSnapshot = await db.collection('ClubMatch/data/competition_players')
      .where('spc_org', '==', 1000)
      .where('spc_competitie', '==', 2)
      .get();

    console.log(`\nCompetition players found: ${playersSnapshot.size}`);
    if (playersSnapshot.size > 0) {
      console.log('Player numbers:', playersSnapshot.docs.map(d => d.data().spc_nummer).sort((a,b) => a-b));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
