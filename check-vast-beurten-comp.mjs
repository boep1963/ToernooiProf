#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

try {
  // Find competitions with vast_beurten = 1 and punten_sys = 1 (WRV)
  const compsSnapshot = await db.collection('competitions')
    .where('vast_beurten', '==', 1)
    .where('punten_sys', '==', 1)
    .limit(5)
    .get();

  if (compsSnapshot.empty) {
    console.log('No competitions with vast_beurten=1 and punten_sys=1 found.');
  } else {
    console.log(`Found ${compsSnapshot.size} competition(s) with fixed turns and WRV:\n`);
    compsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Competition #${data.comp_nr}:`);
      console.log(`  Name: ${data.comp_naam}`);
      console.log(`  Org: ${data.org_nummer}`);
      console.log(`  Vast beurten: ${data.vast_beurten}`);
      console.log(`  Max beurten: ${data.max_beurten}`);
      console.log(`  Punten sys: ${data.punten_sys}`);
      console.log(`  Discipline: ${data.discipline}`);
      console.log('');
    });
  }
} catch (error) {
  console.error('Error:', error);
}

process.exit(0);
