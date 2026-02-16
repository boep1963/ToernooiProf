#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkDataTypes() {
  console.log('=== Checking Data Types in Firestore ===\n');

  // Check a few results docs to see their data types
  const snapshot = await db.collection('ClubMatch/data/results')
    .where('org_nummer', 'in', [1000, '1000'])
    .limit(5)
    .get();

  console.log(`Sample results from org 1000 (${snapshot.size} docs):`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nDoc ID: ${doc.id}`);
    console.log(`  org_nummer: ${data.org_nummer} (type: ${typeof data.org_nummer})`);
    console.log(`  comp_nr: ${data.comp_nr} (type: ${typeof data.comp_nr})`);
    console.log(`  gespeeld: ${data.gespeeld} (type: ${typeof data.gespeeld})`);
    console.log(`  uitslag_code: ${data.uitslag_code}`);
  });

  console.log('\n=== Testing Query Results ===\n');

  // Count results matching org 1000 comp 4 with NUMBER types
  const numQuery = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', 1000)
    .where('comp_nr', '==', 4)
    .get();
  console.log(`Results with NUMBER types (org_nummer==1000, comp_nr==4): ${numQuery.size}`);

  // Count results matching org 1000 comp 4 with STRING types
  const strQuery = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', '1000')
    .where('comp_nr', '==', '4')
    .get();
  console.log(`Results with STRING types (org_nummer=="1000", comp_nr=="4"): ${strQuery.size}`);

  // Check gespeeld filter with different types
  const gespeeldNum = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', '1000')
    .where('comp_nr', '==', '4')
    .where('gespeeld', '==', 1)
    .get();
  console.log(`Results with gespeeld==1 (number): ${gespeeldNum.size}`);

  const gespeeldStr = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', '1000')
    .where('comp_nr', '==', '4')
    .where('gespeeld', '==', '1')
    .get();
  console.log(`Results with gespeeld=="1" (string): ${gespeeldStr.size}`);

  console.log('\n=== Total Expected ===');
  console.log('PHP version shows 51 results for org 1000, comp 4');
}

checkDataTypes()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
