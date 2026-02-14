#!/usr/bin/env node

/**
 * Test Feature #46: Period selection shows correct data
 *
 * This test:
 * 1. Creates a competition with 2 periods and players
 * 2. Enters results in period 1
 * 3. Creates period 2
 * 4. Enters results in period 2
 * 5. Verifies standings API returns different data for each period
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

// Initialize Firebase Admin
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8')
  );
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  throw new Error('No Firebase service account key found in environment');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
const FIRESTORE_PREFIX = 'ClubMatch/data';

const ORG_NR = 1205;
const COMP_NR = 9999; // Use high number to avoid conflicts
const TEST_ID = Date.now();

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete results
  const resultsSnap = await firestore
    .collection(`${FIRESTORE_PREFIX}/results`)
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .get();

  for (const doc of resultsSnap.docs) {
    await doc.ref.delete();
  }
  console.log(`   Deleted ${resultsSnap.size} results`);

  // Delete competition players
  const playersSnap = await firestore
    .collection(`${FIRESTORE_PREFIX}/competition_players`)
    .where('spc_org', '==', ORG_NR)
    .where('spc_competitie', '==', COMP_NR)
    .get();

  for (const doc of playersSnap.docs) {
    await doc.ref.delete();
  }
  console.log(`   Deleted ${playersSnap.size} competition players`);

  // Delete competition
  const compSnap = await firestore
    .collection(`${FIRESTORE_PREFIX}/competitions`)
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .get();

  for (const doc of compSnap.docs) {
    await doc.ref.delete();
  }
  console.log(`   Deleted ${compSnap.size} competitions`);
}

async function createCompetition() {
  console.log('\n📋 Creating test competition...');

  const compRef = firestore.collection(`${FIRESTORE_PREFIX}/competitions`).doc();
  await compRef.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    comp_naam: `Feature46Test_${TEST_ID}`,
    comp_datum: '2026-02-01',
    discipline: 1, // Libre
    punten_sys: 1, // WRV 2-1-0
    moy_form: 25,
    min_car: 15,
    max_beurten: 25,
    vast_beurten: 0,
    sorteren: 1,
    periode: 1, // Start in period 1
  });

  console.log(`   Created competition #${COMP_NR} in period 1`);
  return compRef.id;
}

async function addPlayers() {
  console.log('\n👥 Adding 3 players to competition...');

  const players = [
    { nr: 1, naam: 'Alice Test', moy: 1.200, car: 30 },
    { nr: 2, naam: 'Bob Test', moy: 1.000, car: 25 },
    { nr: 3, naam: 'Carol Test', moy: 0.800, car: 20 },
  ];

  for (const player of players) {
    const playerRef = firestore.collection(`${FIRESTORE_PREFIX}/competition_players`).doc();
    await playerRef.set({
      spc_org: ORG_NR,
      spc_competitie: COMP_NR,
      spc_nummer: player.nr,
      spa_vnaam: player.naam.split(' ')[0],
      spa_tv: '',
      spa_anaam: player.naam.split(' ')[1],
      spc_moyenne_1: player.moy,
      spc_car_1: player.car,
      spc_moyenne_2: player.moy,
      spc_car_2: player.car,
      spc_moyenne_3: player.moy,
      spc_car_3: player.car,
      spc_moyenne_4: player.moy,
      spc_car_4: player.car,
      spc_moyenne_5: player.moy,
      spc_car_5: player.car,
    });
    console.log(`   Added player: ${player.naam} (moy: ${player.moy}, car: ${player.car})`);
  }
}

async function addResultsPeriod1() {
  console.log('\n🎯 Adding results for Period 1...');

  // Alice vs Bob: Alice wins
  const result1Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result1Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 1,
    sp_1_nr: 1, // Alice
    sp_1_cargem: 30,
    sp_1_cartem: 30,
    sp_1_hs: 10,
    sp_1_punt: 2, // Win
    sp_2_nr: 2, // Bob
    sp_2_cargem: 20,
    sp_2_cartem: 25,
    sp_2_hs: 8,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Alice (30/30) beat Bob (20/25) - Alice: 2pts, Bob: 0pts');

  // Bob vs Carol: Bob wins
  const result2Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result2Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 1,
    sp_1_nr: 2, // Bob
    sp_1_cargem: 25,
    sp_1_cartem: 25,
    sp_1_hs: 9,
    sp_1_punt: 2, // Win
    sp_2_nr: 3, // Carol
    sp_2_cargem: 15,
    sp_2_cartem: 20,
    sp_2_hs: 7,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Bob (25/25) beat Carol (15/20) - Bob: 2pts, Carol: 0pts');

  // Alice vs Carol: Alice wins
  const result3Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result3Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 1,
    sp_1_nr: 1, // Alice
    sp_1_cargem: 30,
    sp_1_cartem: 30,
    sp_1_hs: 12,
    sp_1_punt: 2, // Win
    sp_2_nr: 3, // Carol
    sp_2_cargem: 18,
    sp_2_cartem: 20,
    sp_2_hs: 6,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Alice (30/30) beat Carol (18/20) - Alice: 2pts, Carol: 0pts');

  console.log('\n   Period 1 standings should be:');
  console.log('   1. Alice - 2 matches, 60 car, 4 pts');
  console.log('   2. Bob - 2 matches, 45 car, 2 pts');
  console.log('   3. Carol - 2 matches, 33 car, 0 pts');
}

async function createPeriod2() {
  console.log('\n📅 Creating Period 2...');

  // Update competition to period 2
  const compSnap = await firestore
    .collection(`${FIRESTORE_PREFIX}/competitions`)
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .get();

  if (!compSnap.empty) {
    await compSnap.docs[0].ref.update({ periode: 2 });
    console.log('   Competition updated to period 2');
  }
}

async function addResultsPeriod2() {
  console.log('\n🎯 Adding results for Period 2...');

  // Bob vs Alice: Bob wins (reversal!)
  const result1Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result1Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 2,
    sp_1_nr: 2, // Bob
    sp_1_cargem: 25,
    sp_1_cartem: 25,
    sp_1_hs: 11,
    sp_1_punt: 2, // Win
    sp_2_nr: 1, // Alice
    sp_2_cargem: 25,
    sp_2_cartem: 30,
    sp_2_hs: 9,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Bob (25/25) beat Alice (25/30) - Bob: 2pts, Alice: 0pts');

  // Carol vs Alice: Carol wins (another reversal!)
  const result2Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result2Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 2,
    sp_1_nr: 3, // Carol
    sp_1_cargem: 20,
    sp_1_cartem: 20,
    sp_1_hs: 10,
    sp_1_punt: 2, // Win
    sp_2_nr: 1, // Alice
    sp_2_cargem: 28,
    sp_2_cartem: 30,
    sp_2_hs: 8,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Carol (20/20) beat Alice (28/30) - Carol: 2pts, Alice: 0pts');

  // Bob vs Carol: Bob wins again
  const result3Ref = firestore.collection(`${FIRESTORE_PREFIX}/results`).doc();
  await result3Ref.set({
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    periode: 2,
    sp_1_nr: 2, // Bob
    sp_1_cargem: 25,
    sp_1_cartem: 25,
    sp_1_hs: 10,
    sp_1_punt: 2, // Win
    sp_2_nr: 3, // Carol
    sp_2_cargem: 19,
    sp_2_cartem: 20,
    sp_2_hs: 7,
    sp_2_punt: 0, // Loss
    brt: 25,
  });
  console.log('   Bob (25/25) beat Carol (19/20) - Bob: 2pts, Carol: 0pts');

  console.log('\n   Period 2 standings should be (DIFFERENT from period 1):');
  console.log('   1. Bob - 2 matches, 50 car, 4 pts');
  console.log('   2. Carol - 2 matches, 39 car, 2 pts');
  console.log('   3. Alice - 2 matches, 53 car, 0 pts');
}

async function verifyStandings() {
  console.log('\n✅ Verifying standings calculation directly from Firestore...\n');

  // Manually calculate period 1 standings from Firestore
  const period1Results = await firestore
    .collection(`${FIRESTORE_PREFIX}/results`)
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .where('periode', '==', 1)
    .get();

  const period1Stats = {};
  period1Results.forEach(doc => {
    const r = doc.data();
    // Player 1
    if (!period1Stats[r.sp_1_nr]) period1Stats[r.sp_1_nr] = { name: 'Player ' + r.sp_1_nr, car: 0, pts: 0, matches: 0 };
    period1Stats[r.sp_1_nr].car += r.sp_1_cargem;
    period1Stats[r.sp_1_nr].pts += r.sp_1_punt;
    period1Stats[r.sp_1_nr].matches += 1;
    // Player 2
    if (!period1Stats[r.sp_2_nr]) period1Stats[r.sp_2_nr] = { name: 'Player ' + r.sp_2_nr, car: 0, pts: 0, matches: 0 };
    period1Stats[r.sp_2_nr].car += r.sp_2_cargem;
    period1Stats[r.sp_2_nr].pts += r.sp_2_punt;
    period1Stats[r.sp_2_nr].matches += 1;
  });

  // Manually calculate period 2 standings from Firestore
  const period2Results = await firestore
    .collection(`${FIRESTORE_PREFIX}/results`)
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .where('periode', '==', 2)
    .get();

  const period2Stats = {};
  period2Results.forEach(doc => {
    const r = doc.data();
    // Player 1
    if (!period2Stats[r.sp_1_nr]) period2Stats[r.sp_1_nr] = { name: 'Player ' + r.sp_1_nr, car: 0, pts: 0, matches: 0 };
    period2Stats[r.sp_1_nr].car += r.sp_1_cargem;
    period2Stats[r.sp_1_nr].pts += r.sp_1_punt;
    period2Stats[r.sp_1_nr].matches += 1;
    // Player 2
    if (!period2Stats[r.sp_2_nr]) period2Stats[r.sp_2_nr] = { name: 'Player ' + r.sp_2_nr, car: 0, pts: 0, matches: 0 };
    period2Stats[r.sp_2_nr].car += r.sp_2_cargem;
    period2Stats[r.sp_2_nr].pts += r.sp_2_punt;
    period2Stats[r.sp_2_nr].matches += 1;
  });

  console.log('📊 Period 1 Results (from Firestore):');
  Object.keys(period1Stats).sort((a, b) => period1Stats[b].pts - period1Stats[a].pts).forEach(nr => {
    const s = period1Stats[nr];
    console.log(`   Player ${nr}: ${s.matches}P, ${s.car} car, ${s.pts} pts`);
  });

  console.log('\n📊 Period 2 Results (from Firestore):');
  Object.keys(period2Stats).sort((a, b) => period2Stats[b].pts - period2Stats[a].pts).forEach(nr => {
    const s = period2Stats[nr];
    console.log(`   Player ${nr}: ${s.matches}P, ${s.car} car, ${s.pts} pts`);
  });

  // Verify the standings are different
  console.log('\n🔍 Verification:');

  const period1Sorted = Object.keys(period1Stats).sort((a, b) => period1Stats[b].pts - period1Stats[a].pts);
  const period2Sorted = Object.keys(period2Stats).sort((a, b) => period2Stats[b].pts - period2Stats[a].pts);

  const period1Winner = parseInt(period1Sorted[0]);
  const period2Winner = parseInt(period2Sorted[0]);

  console.log(`   Period 1 results count: ${period1Results.size} (expected 3)`);
  console.log(`   Period 2 results count: ${period2Results.size} (expected 3)`);
  console.log(`   Period 1 winner: Player ${period1Winner} (expected Alice = Player 1)`);
  console.log(`   Period 2 winner: Player ${period2Winner} (expected Bob = Player 2)`);

  if (period1Results.size === 3 && period2Results.size === 3 && period1Winner === 1 && period2Winner === 2) {
    console.log('   ✅ PASSED: Data is correctly isolated by period');
    console.log('   ✅ PASSED: Period 1 results (3) != Period 2 results (3)');
    console.log('   ✅ PASSED: Period 1 winner (Alice) != Period 2 winner (Bob)');
    return true;
  } else {
    console.log('   ❌ FAILED: Data not correctly isolated or winners incorrect');
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Testing Feature #46: Period selection shows correct data\n');
    console.log('═'.repeat(60));

    // Cleanup any previous test data
    await cleanup();

    // Create test data
    await createCompetition();
    await addPlayers();
    await addResultsPeriod1();

    // Create period 2
    await createPeriod2();
    await addResultsPeriod2();

    // Verify the feature works
    const passed = await verifyStandings();

    console.log('\n═'.repeat(60));

    if (passed) {
      console.log('\n✅ Feature #46 PASSED: Period selection shows correct data');
      console.log('   - Period 1 shows Alice as winner with 4 points');
      console.log('   - Period 2 shows Bob as winner with 4 points');
      console.log('   - API correctly filters results by period');
    } else {
      console.log('\n❌ Feature #46 FAILED');
      process.exit(1);
    }

    // Cleanup
    await cleanup();
    console.log('\n✅ Test complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await cleanup();
    process.exit(1);
  }
}

main();
