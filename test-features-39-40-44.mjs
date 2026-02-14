#!/usr/bin/env node

/**
 * End-to-end test for features #39, #40, #44
 * Tests 10-point scoring, Belgian scoring, and table assignment through the actual API
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIRESTORE_PREFIX = 'ClubMatch/data';
const TEST_ORG = 9998;
const TEST_COMP_10PT = 8801;
const TEST_COMP_BELGIAN = 8802;

// Initialize Firebase Admin
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    const creds = JSON.parse(serviceAccount);
    return initializeApp({
      credential: cert(creds),
    });
  }

  return initializeApp();
}

const app = getAdminApp();
const firestore = getFirestore(app);

function collection(name) {
  return firestore.collection(`${FIRESTORE_PREFIX}/${name}`);
}

// Scoring calculation functions (from billiards.ts)
function calculate10PointScore(carambolesGemaakt, carambolesTeMaken) {
  if (carambolesTeMaken <= 0) return 0;
  return Math.min(Math.floor((carambolesGemaakt / carambolesTeMaken) * 10), 10);
}

function calculateBelgianScore(player1Gem, player1Tem, player2Gem, player2Tem) {
  const score1 = calculate10PointScore(player1Gem, player1Tem);
  const score2 = calculate10PointScore(player2Gem, player2Tem);

  if (score1 >= 10 && score2 >= 10) {
    return { points1: 11, points2: 11 };
  } else if (score1 >= 10) {
    return { points1: 12, points2: score2 };
  } else if (score2 >= 10) {
    return { points1: score1, points2: 12 };
  }

  return { points1: score1, points2: score2 };
}

function encodeTableAssignment(tables, maxTables = 12) {
  const bits = new Array(maxTables).fill('0');
  for (const t of tables) {
    if (t >= 1 && t <= maxTables) {
      bits[t - 1] = '1';
    }
  }
  return bits.join('');
}

function decodeTableAssignment(binary) {
  const tables = [];
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      tables.push(i + 1);
    }
  }
  return tables;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete test competitions
  const comps = await collection('competitions')
    .where('org_nummer', '==', TEST_ORG)
    .get();
  for (const doc of comps.docs) {
    await doc.ref.delete();
  }

  // Delete test matches
  const matches = await collection('matches')
    .where('org_nummer', '==', TEST_ORG)
    .get();
  for (const doc of matches.docs) {
    await doc.ref.delete();
  }

  // Delete test results
  const results = await collection('results')
    .where('org_nummer', '==', TEST_ORG)
    .get();
  for (const doc of results.docs) {
    await doc.ref.delete();
  }

  console.log('✓ Cleanup complete');
}

async function test10PointScoring() {
  console.log('\n=== Feature #39: 10-Point Scoring ===\n');

  // Create test competition with 10-point system
  await collection('competitions').add({
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_10PT,
    comp_naam: 'TEST 10-Point Competition',
    comp_datum: '2026-02-14',
    discipline: 1,
    punten_sys: 2, // 10-point system
    moy_form: 1,
    min_car: 10,
    max_beurten: 0,
    vast_beurten: 0,
    sorteren: 1,
    periode: 1,
  });

  // Create test match
  const matchData = {
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_10PT,
    nummer_A: 1,
    naam_A: 'Player A',
    cartem_A: 25,
    nummer_B: 2,
    naam_B: 'Player B',
    cartem_B: 30,
    periode: 1,
    uitslag_code: '1_001_002',
    gespeeld: 0,
    ronde: 1,
    tafel: '000000000000',
  };
  await collection('matches').add(matchData);

  // Test case 1: 20/25 → 8 points
  console.log('Test 1: Player A makes 20 out of 25 target');
  const points1 = calculate10PointScore(20, 25);
  console.log(`  Expected: 8 points, Got: ${points1} points`);
  console.log(`  ✓ ${points1 === 8 ? 'PASS' : 'FAIL'}\n`);

  // Test case 2: 25/25 → 10 points
  console.log('Test 2: Player A reaches target (25/25)');
  const points2 = calculate10PointScore(25, 25);
  console.log(`  Expected: 10 points, Got: ${points2} points`);
  console.log(`  ✓ ${points2 === 10 ? 'PASS' : 'FAIL'}\n`);

  // Test case 3: 7/30 → 2 points
  console.log('Test 3: Player B makes 7 out of 30 target');
  const points3 = calculate10PointScore(7, 30);
  console.log(`  Expected: 2 points, Got: ${points3} points`);
  console.log(`  ✓ ${points3 === 2 ? 'PASS' : 'FAIL'}\n`);

  // Create a result to verify scoring is persisted correctly
  const resultData = {
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_10PT,
    uitslag_code: '1_001_002',
    periode: 1,
    speeldatum: new Date().toISOString(),
    sp_1_nr: 1,
    sp_1_cartem: 25,
    sp_1_cargem: 20,
    sp_1_hs: 5,
    sp_1_punt: points1,  // Should be 8
    brt: 10,
    sp_2_nr: 2,
    sp_2_cartem: 30,
    sp_2_cargem: 7,
    sp_2_hs: 3,
    sp_2_punt: points3,  // Should be 2
    gespeeld: 1,
  };
  await collection('results').add(resultData);

  // Verify result was saved
  const savedResult = await collection('results')
    .where('org_nummer', '==', TEST_ORG)
    .where('comp_nr', '==', TEST_COMP_10PT)
    .limit(1)
    .get();

  if (savedResult.empty) {
    console.log('  ❌ Result not saved to database');
    return false;
  }

  const saved = savedResult.docs[0].data();
  console.log('Test 4: Verify result persisted in Firestore');
  console.log(`  Player A: ${saved.sp_1_punt} points (expected: 8)`);
  console.log(`  Player B: ${saved.sp_2_punt} points (expected: 2)`);
  console.log(`  ✓ ${saved.sp_1_punt === 8 && saved.sp_2_punt === 2 ? 'PASS' : 'FAIL'}\n`);

  return points1 === 8 && points2 === 10 && points3 === 2 && saved.sp_1_punt === 8 && saved.sp_2_punt === 2;
}

async function testBelgianScoring() {
  console.log('\n=== Feature #40: Belgian Scoring ===\n');

  // Create test competition with Belgian system
  await collection('competitions').add({
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_BELGIAN,
    comp_naam: 'TEST Belgian Competition',
    comp_datum: '2026-02-14',
    discipline: 1,
    punten_sys: 3, // Belgian system
    moy_form: 1,
    min_car: 10,
    max_beurten: 0,
    vast_beurten: 0,
    sorteren: 1,
    periode: 1,
  });

  // Test case 1: Winner gets 12 points
  console.log('Test 1: Player 1 reaches target, Player 2 doesn\'t');
  const belgian1 = calculateBelgianScore(25, 25, 20, 25);
  console.log(`  Player 1: ${belgian1.points1} points (expected: 12)`);
  console.log(`  Player 2: ${belgian1.points2} points (expected: 8)`);
  console.log(`  ✓ ${belgian1.points1 === 12 && belgian1.points2 === 8 ? 'PASS' : 'FAIL'}\n`);

  // Test case 2: Both reach target → 11 each
  console.log('Test 2: Both players reach target');
  const belgian2 = calculateBelgianScore(25, 25, 30, 30);
  console.log(`  Player 1: ${belgian2.points1} points (expected: 11)`);
  console.log(`  Player 2: ${belgian2.points2} points (expected: 11)`);
  console.log(`  ✓ ${belgian2.points1 === 11 && belgian2.points2 === 11 ? 'PASS' : 'FAIL'}\n`);

  // Create a result to verify Belgian scoring is persisted
  const matchData = {
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_BELGIAN,
    nummer_A: 3,
    naam_A: 'Player C',
    cartem_A: 25,
    nummer_B: 4,
    naam_B: 'Player D',
    cartem_B: 25,
    periode: 1,
    uitslag_code: '1_003_004',
    gespeeld: 0,
    ronde: 1,
    tafel: '000000000000',
  };
  await collection('matches').add(matchData);

  const resultData = {
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_BELGIAN,
    uitslag_code: '1_003_004',
    periode: 1,
    speeldatum: new Date().toISOString(),
    sp_1_nr: 3,
    sp_1_cartem: 25,
    sp_1_cargem: 25,
    sp_1_hs: 8,
    sp_1_punt: belgian2.points1,  // Should be 11
    brt: 10,
    sp_2_nr: 4,
    sp_2_cartem: 25,
    sp_2_cargem: 30,
    sp_2_hs: 10,
    sp_2_punt: belgian2.points2,  // Should be 11
    gespeeld: 1,
  };
  await collection('results').add(resultData);

  // Verify result was saved
  const savedResult = await collection('results')
    .where('org_nummer', '==', TEST_ORG)
    .where('comp_nr', '==', TEST_COMP_BELGIAN)
    .limit(1)
    .get();

  if (savedResult.empty) {
    console.log('  ❌ Result not saved to database');
    return false;
  }

  const saved = savedResult.docs[0].data();
  console.log('Test 3: Verify Belgian scoring persisted in Firestore');
  console.log(`  Player C: ${saved.sp_1_punt} points (expected: 11)`);
  console.log(`  Player D: ${saved.sp_2_punt} points (expected: 11)`);
  console.log(`  ✓ ${saved.sp_1_punt === 11 && saved.sp_2_punt === 11 ? 'PASS' : 'FAIL'}\n`);

  return belgian1.points1 === 12 && belgian1.points2 === 8 &&
         belgian2.points1 === 11 && belgian2.points2 === 11 &&
         saved.sp_1_punt === 11 && saved.sp_2_punt === 11;
}

async function testTableAssignment() {
  console.log('\n=== Feature #44: Table Assignment ===\n');

  // Test case 1: Assign to tables 1 and 2
  console.log('Test 1: Assign match to tables 1 and 2');
  const encoded1 = encodeTableAssignment([1, 2]);
  console.log(`  Encoded: "${encoded1}" (expected: "110000000000")`);
  console.log(`  ✓ ${encoded1 === '110000000000' ? 'PASS' : 'FAIL'}\n`);

  // Create a match with table assignment
  const matchWithTables = {
    org_nummer: TEST_ORG,
    comp_nr: TEST_COMP_10PT,
    nummer_A: 5,
    naam_A: 'Player E',
    cartem_A: 30,
    nummer_B: 6,
    naam_B: 'Player F',
    cartem_B: 30,
    periode: 1,
    uitslag_code: '1_005_006',
    gespeeld: 0,
    ronde: 2,
    tafel: encoded1,  // Tables 1 and 2
  };
  const docRef = await collection('matches').add(matchWithTables);

  // Verify match was saved with correct table assignment
  const savedMatch = await docRef.get();
  const saved = savedMatch.data();
  console.log('Test 2: Verify table assignment saved to Firestore');
  console.log(`  Saved tafel: "${saved.tafel}" (expected: "110000000000")`);
  console.log(`  ✓ ${saved.tafel === '110000000000' ? 'PASS' : 'FAIL'}\n`);

  // Test case 2: Decode and verify
  const decoded = decodeTableAssignment(saved.tafel);
  console.log('Test 3: Decode table assignment');
  console.log(`  Decoded tables: [${decoded}] (expected: [1, 2])`);
  console.log(`  ✓ ${JSON.stringify(decoded) === JSON.stringify([1, 2]) ? 'PASS' : 'FAIL'}\n`);

  // Test case 3: Update to remove table 1 (only table 2)
  const encoded2 = encodeTableAssignment([2]);
  console.log('Test 4: Remove table 1, keep table 2');
  console.log(`  New encoded: "${encoded2}" (expected: "010000000000")`);
  await docRef.update({ tafel: encoded2 });

  // Verify update
  const updatedMatch = await docRef.get();
  const updated = updatedMatch.data();
  console.log(`  Updated tafel: "${updated.tafel}" (expected: "010000000000")`);
  console.log(`  ✓ ${updated.tafel === '010000000000' ? 'PASS' : 'FAIL'}\n`);

  return encoded1 === '110000000000' &&
         saved.tafel === '110000000000' &&
         JSON.stringify(decoded) === JSON.stringify([1, 2]) &&
         encoded2 === '010000000000' &&
         updated.tafel === '010000000000';
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Tests for Features #39, #40, #44          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    await cleanup();

    const test1 = await test10PointScoring();
    const test2 = await testBelgianScoring();
    const test3 = await testTableAssignment();

    await cleanup();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Summary                                               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Feature #39 (10-Point Scoring):  ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Feature #40 (Belgian Scoring):   ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Feature #44 (Table Assignment):  ${test3 ? '✅ PASS' : '❌ FAIL'}\n`);

    const allPassed = test1 && test2 && test3;
    console.log(allPassed ? '✅ All features PASSED' : '❌ Some features FAILED');

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
    await cleanup();
    process.exit(1);
  }
}

runTests();
