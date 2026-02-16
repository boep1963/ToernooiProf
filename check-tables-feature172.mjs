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

async function checkTables() {
  // Check org 1000 tables
  const tablesSnap = await db.collection('tables')
    .where('org_nummer', '==', 1000)
    .get();
  console.log('Org 1000 tables count (number):', tablesSnap.size);

  // Try string variant
  const tablesSnapStr = await db.collection('tables')
    .where('org_nummer', '==', '1000')
    .get();
  console.log('Org 1000 tables count (string):', tablesSnapStr.size);

  // Check organization document
  const orgSnap = await db.collection('organizations')
    .where('org_nummer', '==', 1000)
    .limit(1)
    .get();

  if (!orgSnap.empty) {
    const orgData = orgSnap.docs[0].data();
    console.log('\nOrganization 1000 fields:', Object.keys(orgData).sort());
    if (orgData.aantal_tafels) {
      console.log('aantal_tafels field:', orgData.aantal_tafels);
    }
  }

  // Check unique table numbers in matches for org 1000
  const matchesSnap = await db.collection('matches')
    .where('org_nummer', '==', 1000)
    .get();

  const tableNumbers = new Set();
  matchesSnap.docs.forEach(doc => {
    const tafel = doc.data().tafel;
    if (tafel) tableNumbers.add(tafel);
  });
  console.log('\nUnique table numbers in matches:', Array.from(tableNumbers).sort());
  console.log('Total matches for org 1000:', matchesSnap.size);

  // Check unique table numbers in results for org 1000
  const resultsSnap = await db.collection('results')
    .where('org_nummer', '==', 1000)
    .get();

  const resultTableNumbers = new Set();
  resultsSnap.docs.forEach(doc => {
    const tafelNr = doc.data().tafel_nr;
    if (tafelNr) resultTableNumbers.add(tafelNr);
  });
  console.log('\nUnique table numbers in results:', Array.from(resultTableNumbers).sort());
  console.log('Total results for org 1000:', resultsSnap.size);
}

checkTables().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
