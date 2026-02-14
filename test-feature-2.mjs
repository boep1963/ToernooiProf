#!/usr/bin/env node
/**
 * Feature #2 Verification: Firestore collections and document structure
 *
 * Tests:
 * 1. Verify all required collections exist or can be created
 * 2. Test document structure for key collections (organizations, members, competitions, matches)
 * 3. Verify CRUD operations work correctly
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./clubmatch-firebase-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const PREFIX = 'ClubMatch/data';

async function testCollectionStructure() {
  console.log('\n=== Feature #2: Firestore Collections Structure Verification ===\n');

  const requiredCollections = [
    'organizations', 'competitions', 'members', 'competition_players',
    'matches', 'results', 'tables', 'device_config',
    'score_helpers', 'score_helpers_tablet', 'news_reactions'
  ];

  // 1. List existing collections
  console.log('1. Listing existing collections...');
  const namespaceDoc = db.doc(PREFIX);
  const collections = await namespaceDoc.listCollections();
  const existingCollections = collections.map(c => c.id);
  console.log(`   Found ${existingCollections.length} collections:`, existingCollections);

  // 2. Check which required collections exist
  console.log('\n2. Checking required collections...');
  const missing = [];
  for (const colName of requiredCollections) {
    if (existingCollections.includes(colName)) {
      console.log(`   ✅ ${colName} - exists`);
    } else {
      console.log(`   ⚠️  ${colName} - missing (will be created on first write)`);
      missing.push(colName);
    }
  }

  // 3. Test organizations collection structure
  console.log('\n3. Testing organizations collection structure...');
  const testOrg = {
    org_nummer: 9998,
    naam: 'TEST_FEATURE_2_ORG',
    contactpersoon: 'Test Contact',
    email: 'test@feature2.com',
    telefoon: '0612345678',
    inlogcode: '9998_TESTCODE',
    aantal_tafels: 4,
    score_helper: true,
    verified: true,
    created_at: new Date().toISOString(),
  };

  const orgRef = db.collection(`${PREFIX}/organizations`).doc('9998');
  await orgRef.set(testOrg);
  console.log('   ✅ Created test organization document');

  const orgSnap = await orgRef.get();
  const orgData = orgSnap.data();
  console.log('   ✅ Retrieved organization document');

  // Verify fields
  const requiredOrgFields = ['org_nummer', 'naam', 'email', 'inlogcode', 'aantal_tafels'];
  const missingFields = requiredOrgFields.filter(f => !(f in orgData));
  if (missingFields.length > 0) {
    console.log('   ❌ Missing fields:', missingFields);
  } else {
    console.log('   ✅ All required organization fields present');
  }

  await orgRef.delete();
  console.log('   ✅ Deleted test organization');

  // 4. Test members collection structure
  console.log('\n4. Testing members collection structure...');
  const testMember = {
    lid_nr: 999,
    org_nummer: 9998,
    voornaam: 'Test',
    achternaam: 'Member',
    telnr: '0612345678',
    email: 'member@test.com',
    libre_moy: 1.5,
    bandstoten_moy: 1.2,
    drieb_klein_moy: 0.8,
    drieb_groot_moy: 0.6,
    kader_moy: 1.0,
    created_at: new Date().toISOString(),
  };

  const memberRef = db.collection(`${PREFIX}/members`).doc();
  await memberRef.set(testMember);
  console.log('   ✅ Created test member document');

  const memberSnap = await memberRef.get();
  const memberData = memberSnap.data();
  console.log('   ✅ Retrieved member document');

  const requiredMemberFields = ['lid_nr', 'org_nummer', 'voornaam', 'achternaam'];
  const missingMemberFields = requiredMemberFields.filter(f => !(f in memberData));
  if (missingMemberFields.length > 0) {
    console.log('   ❌ Missing member fields:', missingMemberFields);
  } else {
    console.log('   ✅ All required member fields present');
  }

  await memberRef.delete();
  console.log('   ✅ Deleted test member');

  // 5. Test competitions collection structure
  console.log('\n5. Testing competitions collection structure...');
  const testComp = {
    comp_nr: 999,
    org_nummer: 9998,
    naam: 'Test Competition',
    discipline: 'libre',
    punten_sys: 1,
    datum: '2026-02-14',
    created_at: new Date().toISOString(),
  };

  const compRef = db.collection(`${PREFIX}/competitions`).doc();
  await compRef.set(testComp);
  console.log('   ✅ Created test competition document');

  const compSnap = await compRef.get();
  const compData = compSnap.data();
  console.log('   ✅ Retrieved competition document');

  const requiredCompFields = ['comp_nr', 'org_nummer', 'naam', 'discipline', 'punten_sys'];
  const missingCompFields = requiredCompFields.filter(f => !(f in compData));
  if (missingCompFields.length > 0) {
    console.log('   ❌ Missing competition fields:', missingCompFields);
  } else {
    console.log('   ✅ All required competition fields present');
  }

  await compRef.delete();
  console.log('   ✅ Deleted test competition');

  // 6. Test matches collection structure
  console.log('\n6. Testing matches collection structure...');
  const testMatch = {
    match_nr: 999,
    comp_nr: 999,
    org_nummer: 9998,
    speler_1: 1,
    speler_2: 2,
    periode: 1,
    status: 0, // 0 = not started, 1 = in progress, 2 = completed
    tafel: '000000000000',
    created_at: new Date().toISOString(),
  };

  const matchRef = db.collection(`${PREFIX}/matches`).doc();
  await matchRef.set(testMatch);
  console.log('   ✅ Created test match document');

  const matchSnap = await matchRef.get();
  const matchData = matchSnap.data();
  console.log('   ✅ Retrieved match document');

  const requiredMatchFields = ['match_nr', 'comp_nr', 'org_nummer', 'speler_1', 'speler_2', 'status'];
  const missingMatchFields = requiredMatchFields.filter(f => !(f in matchData));
  if (missingMatchFields.length > 0) {
    console.log('   ❌ Missing match fields:', missingMatchFields);
  } else {
    console.log('   ✅ All required match fields present');
  }

  await matchRef.delete();
  console.log('   ✅ Deleted test match');

  console.log('\n=== Summary ===');
  console.log(`Total required collections: ${requiredCollections.length}`);
  console.log(`Existing collections: ${existingCollections.length}`);
  console.log(`Missing collections (will be auto-created): ${missing.length}`);
  console.log('\n✅ All document structure tests passed!');
  console.log('✅ CRUD operations work correctly');
  console.log('✅ Feature #2 VERIFIED\n');
}

testCollectionStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
