#!/usr/bin/env node

/**
 * Setup test data for Feature #143
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

const ORG_NUMMER = 1205;
const TEST_COMP_NAME = 'TEST_MAX_PERIODS';

async function setupTestData() {
  console.log('Setting up test data for Feature #143...\n');

  try {
    // 1. Check if test competition already exists
    const existingSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', ORG_NUMMER)
      .where('comp_naam', '==', TEST_COMP_NAME)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const doc = existingSnapshot.docs[0];
      const data = doc.data();
      console.log(`Competition "${TEST_COMP_NAME}" already exists (comp_nr=${data.comp_nr})`);

      // Update it to periode 5
      await doc.ref.update({ periode: 5 });
      console.log(`✓ Updated to periode=5`);
      console.log(`\nTest ready! Competition #${data.comp_nr} is at max periods.`);
      console.log(`Navigate to: http://localhost:3002/competities/${data.comp_nr}/periodes`);
      return;
    }

    // 2. Get next comp_nr
    const allComps = await db.collection('competitions')
      .where('org_nummer', '==', ORG_NUMMER)
      .get();

    let maxCompNr = 0;
    allComps.forEach(doc => {
      const data = doc.data();
      if (data.comp_nr > maxCompNr) maxCompNr = data.comp_nr;
    });

    const newCompNr = maxCompNr + 1;

    // 3. Create test competition at periode 5
    console.log(`Creating new competition "${TEST_COMP_NAME}" (comp_nr=${newCompNr})...`);

    await db.collection('competitions').add({
      org_nummer: ORG_NUMMER,
      comp_nr: newCompNr,
      comp_naam: TEST_COMP_NAME,
      comp_datum: '2026-03-01',
      discipline: 1, // Libre
      periode: 5, // Start at max
      punten_sys: 1,
      sorteren: 1,
      moy_form: 1,
      min_car: 0,
      wrv_bonus: 0,
      vast_beurten: 0,
    });

    console.log(`✓ Created competition #${newCompNr} at periode=5`);
    console.log(`\nTest ready! Navigate to: http://localhost:3002/competities/${newCompNr}/periodes`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupTestData();
