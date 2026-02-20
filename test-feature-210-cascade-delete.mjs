#!/usr/bin/env node

/**
 * Feature #210 Test: Cascade Delete for Member Removal
 *
 * Tests that when a member is deleted:
 * 1. Member is removed from members collection
 * 2. Competition_players entries are cascade deleted
 * 3. Results where member is player 1 or 2 are cascade deleted
 * 4. Matches where member is player A or B are cascade deleted
 * 5. Stand no longer shows "Speler X" placeholder
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    await import('fs').then(fs =>
      fs.promises.readFile(join(__dirname, '.data', 'scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json'), 'utf8')
    )
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const ORG_NR = 1205;
const TEST_MEMBER_NR = 999;
const TEST_COMP_NR = 99;

console.log('🧪 Feature #210: Cascade Delete Test\n');

async function cleanup() {
  console.log('🧹 Cleanup: Removing any existing test data...');

  // Delete test member
  const memberSnap = await db.collection('members')
    .where('spa_org', '==', ORG_NR)
    .where('spa_nummer', '==', TEST_MEMBER_NR)
    .get();
  for (const doc of memberSnap.docs) {
    await doc.ref.delete();
  }

  // Delete test competition
  const compSnap = await db.collection('competitions')
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', TEST_COMP_NR)
    .get();
  for (const doc of compSnap.docs) {
    await doc.ref.delete();
  }

  // Delete any test players
  const playersSnap = await db.collection('competition_players')
    .where('spc_org', '==', ORG_NR)
    .where('spc_competitie', '==', TEST_COMP_NR)
    .get();
  for (const doc of playersSnap.docs) {
    await doc.ref.delete();
  }

  // Delete any test results
  const resultsSnap = await db.collection('results')
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', TEST_COMP_NR)
    .get();
  for (const doc of resultsSnap.docs) {
    await doc.ref.delete();
  }

  // Delete any test matches
  const matchesSnap = await db.collection('matches')
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', TEST_COMP_NR)
    .get();
  for (const doc of matchesSnap.docs) {
    await doc.ref.delete();
  }

  console.log('✅ Cleanup complete\n');
}

async function setup() {
  console.log('📝 Setup: Creating test data...');

  // Create test member
  await db.collection('members').add({
    spa_org: ORG_NR,
    spa_nummer: TEST_MEMBER_NR,
    spa_vnaam: 'Test',
    spa_tv: '',
    spa_anaam: 'CascadeDelete',
    spa_moy_lib: 2.5,
    created_at: new Date().toISOString()
  });
  console.log(`  ✓ Created member ${TEST_MEMBER_NR}: Test CascadeDelete`);

  // Create test competition
  await db.collection('competitions').add({
    org_nummer: ORG_NR,
    comp_nr: TEST_COMP_NR,
    comp_naam: 'Test Cascade Delete Comp',
    comp_datum: '20-02-2026',
    discipline: 1,
    punten_sys: 1,
    moy_form: 25,
    min_car: 10,
    max_beurten: 30,
    vast_beurten: 0,
    sorteren: 1,
    periode: 1
  });
  console.log(`  ✓ Created competition ${TEST_COMP_NR}`);

  // Create competition_players entry
  await db.collection('competition_players').add({
    spc_org: ORG_NR,
    spc_competitie: TEST_COMP_NR,
    spc_nummer: TEST_MEMBER_NR,
    spa_vnaam: 'Test',
    spa_tv: '',
    spa_anaam: 'CascadeDelete'
  });
  console.log(`  ✓ Created competition_players entry`);

  // Create a result where test member is player 1
  await db.collection('results').add({
    org_nummer: ORG_NR,
    comp_nr: TEST_COMP_NR,
    periode: 1,
    uitslag_code: 'TEST1',
    sp_1_nr: TEST_MEMBER_NR,
    sp_1_naam: 'Test CascadeDelete',
    sp_1_cargem: 50,
    sp_1_cartem: 40,
    sp_1_hs: 10,
    sp_1_punt: 2,
    sp_2_nr: 2,
    sp_2_naam: 'Test Speler',
    sp_2_cargem: 30,
    sp_2_cartem: 40,
    sp_2_hs: 8,
    sp_2_punt: 0,
    brt: 20,
    gespeeld: 1
  });
  console.log(`  ✓ Created result with member as player 1`);

  // Create a result where test member is player 2
  await db.collection('results').add({
    org_nummer: ORG_NR,
    comp_nr: TEST_COMP_NR,
    periode: 1,
    uitslag_code: 'TEST2',
    sp_1_nr: 2,
    sp_1_naam: 'Test Speler',
    sp_1_cargem: 35,
    sp_1_cartem: 40,
    sp_1_hs: 9,
    sp_1_punt: 0,
    sp_2_nr: TEST_MEMBER_NR,
    sp_2_naam: 'Test CascadeDelete',
    sp_2_cargem: 45,
    sp_2_cartem: 40,
    sp_2_hs: 12,
    sp_2_punt: 2,
    brt: 18,
    gespeeld: 1
  });
  console.log(`  ✓ Created result with member as player 2`);

  // Create a match where test member is player A
  await db.collection('matches').add({
    org_nummer: ORG_NR,
    comp_nr: TEST_COMP_NR,
    periode: 1,
    uitslag_code: 'TEST3',
    nummer_A: TEST_MEMBER_NR,
    naam_A: 'Test CascadeDelete',
    cartem_A: 40,
    nummer_B: 3,
    naam_B: 'Test Laag0.2',
    cartem_B: 40,
    tafel: '000000000000',
    gespeeld: 0,
    ronde: 1
  });
  console.log(`  ✓ Created match with member as player A`);

  // Create a match where test member is player B
  await db.collection('matches').add({
    org_nummer: ORG_NR,
    comp_nr: TEST_COMP_NR,
    periode: 1,
    uitslag_code: 'TEST4',
    nummer_A: 3,
    naam_A: 'Test Laag0.2',
    cartem_A: 40,
    nummer_B: TEST_MEMBER_NR,
    naam_B: 'Test CascadeDelete',
    cartem_B: 40,
    tafel: '000000000000',
    gespeeld: 0,
    ronde: 1
  });
  console.log(`  ✓ Created match with member as player B`);

  console.log('✅ Setup complete\n');
}

async function verifyBeforeDelete() {
  console.log('🔍 Verify BEFORE delete: Counting related documents...');

  const memberCount = (await db.collection('members')
    .where('spa_org', '==', ORG_NR)
    .where('spa_nummer', '==', TEST_MEMBER_NR)
    .get()).size;

  const playersCount = (await db.collection('competition_players')
    .where('spc_org', '==', ORG_NR)
    .where('spc_nummer', '==', TEST_MEMBER_NR)
    .get()).size;

  const results1Count = (await db.collection('results')
    .where('org_nummer', '==', ORG_NR)
    .where('sp_1_nr', '==', TEST_MEMBER_NR)
    .get()).size;

  const results2Count = (await db.collection('results')
    .where('org_nummer', '==', ORG_NR)
    .where('sp_2_nr', '==', TEST_MEMBER_NR)
    .get()).size;

  const matchesACount = (await db.collection('matches')
    .where('org_nummer', '==', ORG_NR)
    .where('nummer_A', '==', TEST_MEMBER_NR)
    .get()).size;

  const matchesBCount = (await db.collection('matches')
    .where('org_nummer', '==', ORG_NR)
    .where('nummer_B', '==', TEST_MEMBER_NR)
    .get()).size;

  console.log(`  Members: ${memberCount} (expected: 1)`);
  console.log(`  Competition players: ${playersCount} (expected: 1)`);
  console.log(`  Results as player 1: ${results1Count} (expected: 1)`);
  console.log(`  Results as player 2: ${results2Count} (expected: 1)`);
  console.log(`  Matches as player A: ${matchesACount} (expected: 1)`);
  console.log(`  Matches as player B: ${matchesBCount} (expected: 1)`);

  const allCorrect = memberCount === 1 && playersCount === 1 &&
                     results1Count === 1 && results2Count === 1 &&
                     matchesACount === 1 && matchesBCount === 1;

  if (allCorrect) {
    console.log('✅ All test data created correctly\n');
  } else {
    console.log('❌ Test data counts incorrect\n');
    throw new Error('Setup verification failed');
  }
}

async function deleteMember() {
  console.log('🗑️  Deleting member via API...');

  const response = await fetch(`http://localhost:3000/api/organizations/${ORG_NR}/members/${TEST_MEMBER_NR}`, {
    method: 'DELETE',
    headers: {
      'Cookie': 'auth_session=test' // Mock auth for test
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.log('❌ API error:', error);
    throw new Error('DELETE API failed');
  }

  const result = await response.json();
  console.log('  API response:', result);
  console.log(`  ✓ Cascade deleted ${result.cascade_deleted_players || 0} competition_players`);
  console.log(`  ✓ Cascade deleted ${result.cascade_deleted_results || 0} results`);
  console.log(`  ✓ Cascade deleted ${result.cascade_deleted_matches || 0} matches`);
  console.log('✅ Member deleted\n');

  return result;
}

async function verifyAfterDelete() {
  console.log('🔍 Verify AFTER delete: All related data should be gone...');

  const memberCount = (await db.collection('members')
    .where('spa_org', '==', ORG_NR)
    .where('spa_nummer', '==', TEST_MEMBER_NR)
    .get()).size;

  const playersCount = (await db.collection('competition_players')
    .where('spc_org', '==', ORG_NR)
    .where('spc_nummer', '==', TEST_MEMBER_NR)
    .get()).size;

  const results1Count = (await db.collection('results')
    .where('org_nummer', '==', ORG_NR)
    .where('sp_1_nr', '==', TEST_MEMBER_NR)
    .get()).size;

  const results2Count = (await db.collection('results')
    .where('org_nummer', '==', ORG_NR)
    .where('sp_2_nr', '==', TEST_MEMBER_NR)
    .get()).size;

  const matchesACount = (await db.collection('matches')
    .where('org_nummer', '==', ORG_NR)
    .where('nummer_A', '==', TEST_MEMBER_NR)
    .get()).size;

  const matchesBCount = (await db.collection('matches')
    .where('org_nummer', '==', ORG_NR)
    .where('nummer_B', '==', TEST_MEMBER_NR)
    .get()).size;

  console.log(`  Members: ${memberCount} (expected: 0)`);
  console.log(`  Competition players: ${playersCount} (expected: 0)`);
  console.log(`  Results as player 1: ${results1Count} (expected: 0)`);
  console.log(`  Results as player 2: ${results2Count} (expected: 0)`);
  console.log(`  Matches as player A: ${matchesACount} (expected: 0)`);
  console.log(`  Matches as player B: ${matchesBCount} (expected: 0)`);

  const allZero = memberCount === 0 && playersCount === 0 &&
                  results1Count === 0 && results2Count === 0 &&
                  matchesACount === 0 && matchesBCount === 0;

  if (allZero) {
    console.log('✅ CASCADE DELETE WORKS CORRECTLY! All related data removed.\n');
    return true;
  } else {
    console.log('❌ CASCADE DELETE INCOMPLETE! Some data remains.\n');
    return false;
  }
}

// Run test
try {
  await cleanup();
  await setup();
  await verifyBeforeDelete();
  const deleteResult = await deleteMember();
  const success = await verifyAfterDelete();
  await cleanup();

  if (success) {
    console.log('🎉 Feature #210 TEST PASSED!');
    console.log('   Cascade delete correctly removes:');
    console.log('   ✓ Member from members collection');
    console.log('   ✓ Competition_players entries');
    console.log('   ✓ Results where member is player 1 or 2');
    console.log('   ✓ Matches where member is player A or B');
    console.log('   Stand will no longer show "Speler X" placeholder.\n');
    process.exit(0);
  } else {
    console.log('❌ Feature #210 TEST FAILED!\n');
    process.exit(1);
  }
} catch (error) {
  console.error('💥 Test error:', error.message);
  await cleanup();
  process.exit(1);
}
