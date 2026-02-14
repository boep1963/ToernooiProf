#!/usr/bin/env node

/**
 * Test Feature #143: Max periods (5) enforced with error message
 *
 * This script tests that creating more than 5 periods shows an error.
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
const TEST_COMP_NAME = `TEST_MAXPERIODS_${Date.now()}`;

async function testMaxPeriodsEnforcement() {
  console.log('\n=== Testing Feature #143: Max Periods Enforcement ===\n');

  try {
    // 1. Create a test competition
    console.log(`1. Creating test competition "${TEST_COMP_NAME}"...`);

    // Get existing competitions to determine next comp_nr
    const existingComps = await db.collection('competitions')
      .where('org_nummer', '==', ORG_NUMMER)
      .get();

    let maxCompNr = 0;
    existingComps.forEach(doc => {
      const data = doc.data();
      if (data.comp_nr > maxCompNr) maxCompNr = data.comp_nr;
    });

    const newCompNr = maxCompNr + 1;

    const compRef = await db.collection('competitions').add({
      org_nummer: ORG_NUMMER,
      comp_nr: newCompNr,
      comp_naam: TEST_COMP_NAME,
      comp_datum: '2026-03-01',
      discipline: 1, // Libre
      periode: 1, // Start at period 1
      punten_sys: 1,
      sorteren: 1,
      moy_form: 1,
      min_car: 0,
    });

    console.log(`   ✓ Created competition #${newCompNr} with periode=1`);

    // 2. Manually increment periode to 5 (simulating 4 period creations)
    console.log('\n2. Setting competition to periode=5 (maximum)...');
    await compRef.update({ periode: 5 });
    console.log('   ✓ Competition now at periode=5');

    // 3. Verify periode is 5
    const compDoc = await compRef.get();
    const compData = compDoc.data();
    const currentPeriode = compData.periode;

    if (currentPeriode !== 5) {
      console.error(`   ✗ FAILED: Expected periode=5, got ${currentPeriode}`);
      await cleanup(compRef);
      process.exit(1);
    }
    console.log(`   ✓ Verified: periode=${currentPeriode}`);

    // 4. Attempt to create period 6 (should fail)
    console.log('\n3. Attempting to create period 6 (should fail)...');

    const response = await fetch(`http://localhost:3002/api/organizations/${ORG_NUMMER}/competitions/${newCompNr}/periods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test-session' // Mock session for testing
      },
      body: JSON.stringify({ players: [] })
    });

    const responseData = await response.json();

    console.log(`   Response status: ${response.status}`);
    console.log(`   Response body:`, responseData);

    // 5. Verify error response
    if (response.status !== 400) {
      console.error(`   ✗ FAILED: Expected status 400, got ${response.status}`);
      await cleanup(compRef);
      process.exit(1);
    }
    console.log('   ✓ Correct HTTP status: 400 Bad Request');

    if (!responseData.error) {
      console.error(`   ✗ FAILED: No error message in response`);
      await cleanup(compRef);
      process.exit(1);
    }
    console.log(`   ✓ Error message present: "${responseData.error}"`);

    if (!responseData.error.includes('Maximaal 5 periodes')) {
      console.error(`   ✗ FAILED: Error message doesn't mention max 5 periods`);
      console.error(`      Got: "${responseData.error}"`);
      await cleanup(compRef);
      process.exit(1);
    }
    console.log('   ✓ Error message in Dutch with correct content');

    // 6. Verify periode is still 5 (not incremented)
    console.log('\n4. Verifying periode remains at 5...');
    const finalDoc = await compRef.get();
    const finalData = finalDoc.data();
    const finalPeriode = finalData.periode;

    if (finalPeriode !== 5) {
      console.error(`   ✗ FAILED: Expected periode=5, got ${finalPeriode}`);
      await cleanup(compRef);
      process.exit(1);
    }
    console.log(`   ✓ Periode unchanged: ${finalPeriode}`);

    // 7. Cleanup
    await cleanup(compRef);

    console.log('\n=== ✓ ALL TESTS PASSED ===\n');
    console.log('Feature #143 verified:');
    console.log('  ✓ Creating more than 5 periods returns 400 error');
    console.log('  ✓ Error message in Dutch');
    console.log('  ✓ Error mentions "Maximaal 5 periodes"');
    console.log('  ✓ Periode count not incremented beyond 5');
    console.log('');

  } catch (error) {
    console.error('\n✗ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function cleanup(compRef) {
  console.log('\n5. Cleaning up test competition...');
  if (compRef) {
    await compRef.delete();
    console.log('   ✓ Test competition deleted');
  }
}

// Run the test
testMaxPeriodsEnforcement();
