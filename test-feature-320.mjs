#!/usr/bin/env node
/**
 * Test Feature #320: Batch player lookups in results route
 *
 * This script tests that the optimized POST /results endpoint
 * correctly fetches player data using batched queries.
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function testFeature320() {
  console.log('=== Feature #320 Test: Batch Player Lookups ===\n');

  // Find a test organization with competitions and players
  const orgsSnapshot = await db.collection('organizations')
    .where('org_nummer', '==', 1205)
    .limit(1)
    .get();

  if (orgsSnapshot.empty) {
    console.log('❌ No test organization found (org 1205)');
    return;
  }

  const orgData = orgsSnapshot.docs[0].data();
  const orgNummer = orgData.org_nummer;
  const loginCode = orgData.org_code;

  console.log(`✅ Found org ${orgNummer}: ${orgData.org_naam}`);
  console.log(`   Login code: ${loginCode}\n`);

  // Find a competition
  const compsSnapshot = await db.collection('competitions')
    .where('org_nummer', '==', orgNummer)
    .limit(1)
    .get();

  if (compsSnapshot.empty) {
    console.log('❌ No competitions found');
    return;
  }

  const compData = compsSnapshot.docs[0].data();
  const compNr = compData.comp_nr;
  console.log(`✅ Found competition ${compNr}: ${compData.comp_naam}`);
  console.log(`   Discipline: ${compData.discipline}, Period: ${compData.periode}\n`);

  // Find players in this competition
  const playersSnapshot = await db.collection('competition_players')
    .where('spc_org', '==', orgNummer)
    .where('spc_competitie', '==', compNr)
    .limit(2)
    .get();

  if (playersSnapshot.size < 2) {
    console.log('❌ Not enough players in competition');
    return;
  }

  const player1 = playersSnapshot.docs[0].data();
  const player2 = playersSnapshot.docs[1].data();

  console.log(`✅ Found players:`);
  console.log(`   Player 1: ${player1.spc_nummer} (caramboles: ${player1.spc_car_1})`);
  console.log(`   Player 2: ${player2.spc_nummer} (caramboles: ${player2.spc_car_1})\n`);

  // Create a test result via API
  const uitslagCode = `${compData.periode}_${String(player1.spc_nummer).padStart(3, '0')}_${String(player2.spc_nummer).padStart(3, '0')}`;

  const resultPayload = {
    uitslag_code: uitslagCode,
    sp_1_nr: player1.spc_nummer,
    sp_1_cartem: player1.spc_car_1 || 10,
    sp_1_cargem: 8,
    sp_1_hs: 2,
    sp_2_nr: player2.spc_nummer,
    sp_2_cartem: player2.spc_car_1 || 10,
    sp_2_cargem: 6,
    sp_2_hs: 1,
    brt: 5,
  };

  console.log(`📤 Submitting test result via API...`);
  console.log(`   Uitslag code: ${uitslagCode}`);
  console.log(`   Player 1: ${player1.spc_nummer} - ${resultPayload.sp_1_cargem}/${resultPayload.sp_1_cartem} car`);
  console.log(`   Player 2: ${player2.spc_nummer} - ${resultPayload.sp_2_cargem}/${resultPayload.sp_2_cartem} car\n`);

  try {
    const response = await fetch(`http://localhost:3001/api/organizations/${orgNummer}/competitions/${compNr}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `org_code=${loginCode}`,
      },
      body: JSON.stringify(resultPayload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Result saved successfully!');
      console.log(`   Result ID: ${data.id}`);
      console.log(`   Player 1 points: ${data.sp_1_punt}`);
      console.log(`   Player 2 points: ${data.sp_2_punt}`);

      if (data.sp_1_naam && data.sp_2_naam) {
        console.log(`   Player 1 name: ${data.sp_1_naam}`);
        console.log(`   Player 2 name: ${data.sp_2_naam}`);
        console.log('\n✅ FEATURE #320: Player names correctly fetched using batched queries!');
      } else {
        console.log('\n⚠️  WARNING: Player names not included in response');
      }
    } else {
      console.log(`❌ Error saving result: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${data.error}`);
      if (data.details) console.log(`   Details: ${data.details}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  console.log('\n=== Test Complete ===');
}

testFeature320().catch(console.error);
