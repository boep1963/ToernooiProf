#!/usr/bin/env node

/**
 * Create 100 test members via Firestore for performance testing
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Parse .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
const serviceAccount = JSON.parse(serviceAccountMatch[1]);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const ORG_NUMBER = 1205;

async function main() {
  console.log('Creating 100 test members...');

  // Get current max number
  const snapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();

  let maxNumber = 0;
  snapshot.forEach(doc => {
    const num = doc.data().spa_nummer;
    if (num > maxNumber) maxNumber = num;
  });

  console.log(`Starting from member #${maxNumber + 1}`);

  // Create 100 members
  for (let i = 1; i <= 100; i++) {
    await db.collection('members').add({
      spa_nummer: maxNumber + i,
      spa_vnaam: `Perf`,
      spa_tv: `Test${i}`,
      spa_anaam: `Member`,
      spa_org: ORG_NUMBER,
      spa_moy_lib: parseFloat((Math.random() * 5).toFixed(3)),
      spa_moy_band: parseFloat((Math.random() * 3).toFixed(3)),
      spa_moy_3bkl: parseFloat((Math.random() * 2).toFixed(3)),
      spa_moy_3bgr: parseFloat((Math.random() * 1.5).toFixed(3)),
      spa_moy_kad: parseFloat((Math.random() * 4).toFixed(3)),
      created_at: new Date().toISOString(),
      _test: 'feature85' // Mark for cleanup
    });

    if (i % 20 === 0) console.log(`  ${i}/100 created`);
  }

  console.log('✅ Done! 100 members created');
  process.exit(0);
}

main();
