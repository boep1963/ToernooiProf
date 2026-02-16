#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
if (!serviceAccountMatch) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountMatch[1]);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function checkMatchFields() {
  // First check org 1000 which should have imported data
  console.log('Checking org 1000 for matches...\n');
  const org1000Snapshot = await db.collection('ClubMatch/data/matches')
    .where('org_nummer', '==', 1000)
    .limit(3)
    .get();

  console.log(`Found ${org1000Snapshot.size} matches for org 1000\n`);

  if (!org1000Snapshot.empty) {
    org1000Snapshot.forEach((doc, idx) => {
      const data = doc.data();
      console.log(`Match ${idx + 1} (org 1000):`);
      console.log('  Fields:', Object.keys(data).sort().join(', '));
      console.log('  org_nummer:', data.org_nummer);
      console.log('  comp_nr:', data.comp_nr);
      console.log('  periode:', data.periode);
      console.log('  gespeeld:', data.gespeeld);
      console.log('');
    });
  }

  // Now check competitions for org 1000
  console.log('\nChecking competitions for org 1000...\n');
  const compsSnapshot = await db.collection('ClubMatch/data/competitions')
    .where('org_nummer', '==', 1000)
    .limit(5)
    .get();

  console.log(`Found ${compsSnapshot.size} competitions\n`);
  compsSnapshot.forEach((doc, idx) => {
    const data = doc.data();
    console.log(`Competition ${idx + 1}:`);
    console.log('  Document ID:', doc.id);
    console.log('  comp_nr:', data.comp_nr);
    console.log('  comp_naam:', data.comp_naam);
    console.log('');
  });

  // Get org 1000 info
  console.log('\nGetting org 1000 info...\n');
  const orgSnapshot = await db.collection('ClubMatch/data/organizations')
    .where('org_nummer', '==', 1000)
    .limit(1)
    .get();

  if (!orgSnapshot.empty) {
    const orgData = orgSnapshot.docs[0].data();
    console.log('Org 1000 info:');
    console.log('  Org name:', orgData.org_naam);
    console.log('  Login code (org_code):', orgData.org_code);
    console.log('  Email:', orgData.org_wl_email);
  }

  process.exit(0);
}

checkMatchFields().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
