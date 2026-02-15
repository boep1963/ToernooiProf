#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./.data/serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  try {
    // Check org 1000 results
    const resultsSnapshot = await db.collection('ClubMatch/data/results')
      .where('org_nummer', '==', 1000)
      .limit(10)
      .get();

    console.log('Org 1000 results count:', resultsSnapshot.size);
    if (resultsSnapshot.size > 0) {
      console.log('\nSample results:');
      resultsSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.uitslag_code} | sp_1_nr: ${data.sp_1_nr}, sp_2_nr: ${data.sp_2_nr}, comp: ${data.uitslag_code.split('_')[1]}`);
      });
    }

    // Check org 1000 matches
    const matchesSnapshot = await db.collection('ClubMatch/data/matches')
      .where('org_nummer', '==', 1000)
      .limit(10)
      .get();

    console.log('\nOrg 1000 matches count:', matchesSnapshot.size);
    if (matchesSnapshot.size > 0) {
      console.log('\nSample matches:');
      matchesSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.uitslag_code} | comp_nr: ${data.comp_nr}`);
      });
    }

    // Get competition info for org 1000
    const compsSnapshot = await db.collection('ClubMatch/data/competitions')
      .where('org_nummer', '==', 1000)
      .limit(5)
      .get();

    console.log('\nOrg 1000 competitions count:', compsSnapshot.size);
    if (compsSnapshot.size > 0) {
      console.log('\nSample competitions:');
      compsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - comp_nr: ${data.comp_nr}, naam: ${data.comp_naam}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
