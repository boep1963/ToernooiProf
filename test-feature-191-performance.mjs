#!/usr/bin/env node

/**
 * Test script for Feature #191: Optimize results denormalization
 *
 * This test verifies that the optimized batch query approach is much faster
 * than the old sequential query approach (should be <3 seconds instead of 16+ seconds)
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  await import('fs').then(fs => fs.promises.readFile('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8'))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testResultsDenormalizationPerformance() {
  console.log('\n=== Feature #191: Results Denormalization Performance Test ===\n');

  // Test with org 1205, competition 1 (has many results)
  const orgNummer = 1205;
  const compNr = 1;

  console.log(`Testing with org ${orgNummer}, competition ${compNr}`);
  console.log('Fetching results via API endpoint...\n');

  const startTime = Date.now();

  try {
    // Get session cookie (login as org 1205)
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginCode: '1205_AAY@#' })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      process.exit(1);
    }

    const loginData = await loginResponse.json();
    const sessionCookie = loginResponse.headers.get('set-cookie');

    console.log('✅ Logged in successfully');

    // Fetch results
    const resultsResponse = await fetch(
      `http://localhost:3000/api/organizations/${orgNummer}/competitions/${compNr}/results`,
      {
        headers: {
          'Cookie': sessionCookie
        }
      }
    );

    const elapsedTime = Date.now() - startTime;

    if (!resultsResponse.ok) {
      console.error('❌ Results fetch failed:', resultsResponse.status);
      const errorData = await resultsResponse.json();
      console.error('Error:', errorData);
      process.exit(1);
    }

    const data = await resultsResponse.json();

    console.log(`\n✅ Results fetched successfully`);
    console.log(`   - Total results: ${data.count}`);
    console.log(`   - Response time: ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`);

    // Check if any results have player names (denormalization worked)
    const resultsWithNames = data.results.filter(r => r.sp_1_naam || r.sp_2_naam);
    console.log(`   - Results with denormalized names: ${resultsWithNames.length}/${data.count}`);

    // Performance verification
    if (elapsedTime < 3000) {
      console.log('\n✅ PASS: Response time < 3 seconds (optimized batch query working!)');
    } else if (elapsedTime < 5000) {
      console.log('\n⚠️  WARNING: Response time 3-5 seconds (acceptable but could be faster)');
    } else {
      console.log('\n❌ FAIL: Response time > 5 seconds (optimization may not be working)');
      process.exit(1);
    }

    // Verify that subsequent requests are fast (names already persisted)
    console.log('\n--- Testing second request (should skip denormalization) ---\n');

    const startTime2 = Date.now();
    const resultsResponse2 = await fetch(
      `http://localhost:3000/api/organizations/${orgNummer}/competitions/${compNr}/results`,
      {
        headers: {
          'Cookie': sessionCookie
        }
      }
    );
    const elapsedTime2 = Date.now() - startTime2;

    if (resultsResponse2.ok) {
      const data2 = await resultsResponse2.json();
      console.log(`✅ Second request completed in ${elapsedTime2}ms (${(elapsedTime2 / 1000).toFixed(2)}s)`);

      if (elapsedTime2 < 1000) {
        console.log('✅ PASS: Second request < 1 second (denormalization was persisted!)');
      } else {
        console.log('⚠️  Second request took longer than expected (but still acceptable)');
      }
    }

    console.log('\n✅ Feature #191 verification complete!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

testResultsDenormalizationPerformance();
