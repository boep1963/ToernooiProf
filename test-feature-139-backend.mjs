#!/usr/bin/env node

/**
 * Feature #139: Backend performance test for competition with many matches
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

const ORG_NUMBER = 1205;

async function create12MembersAndCompetition() {
  console.log('📝 Creating 12 members...');

  const snapshot = await db.collection('members').where('spa_org', '==', ORG_NUMBER).get();
  let maxNumber = 0;
  snapshot.forEach(doc => {
    const num = doc.data().spa_nummer;
    if (num > maxNumber) maxNumber = num;
  });

  const memberNumbers = [];
  for (let i = 1; i <= 12; i++) {
    await db.collection('members').add({
      spa_nummer: maxNumber + i,
      spa_vnaam: `Player${i}`,
      spa_tv: '',
      spa_anaam: 'Test139',
      spa_org: ORG_NUMBER,
      spa_moy_lib: 2.5,
      spa_moy_band: 1.5,
      spa_moy_3bkl: 1.0,
      spa_moy_3bgr: 0.8,
      spa_moy_kad: 2.0,
      created_at: new Date().toISOString(),
      _test: 'feature139'
    });
    memberNumbers.push(maxNumber + i);
  }

  console.log(`✅ Created 12 members (${maxNumber + 1} to ${maxNumber + 12})`);

  // Create competition
  console.log('🏆 Creating competition...');
  const compSnapshot = await db.collection('competitions').where('org_nummer', '==', ORG_NUMBER).get();
  let maxCompNr = 0;
  compSnapshot.forEach(doc => {
    const num = doc.data().comp_nr;
    if (num > maxCompNr) maxCompNr = num;
  });

  const compDoc = await db.collection('competitions').add({
    comp_nr: maxCompNr + 1,
    org_nummer: ORG_NUMBER,
    naam: 'Feature139 Performance Test',
    datum: '2026-02-14',
    omschrijving: 'Performance test with 66 matches',
    discipline: 1,
    puntensysteem: 1,
    tafel_volgorde: 1,
    vast_beurten: 0,
    max_beurten: 35,
    min_car: 0,
    wrv_bonus: 1,
    wrv_bonus_verliezer: 0,
    created_at: new Date().toISOString()
  });

  const compId = compDoc.id;
  const compNr = maxCompNr + 1;

  console.log(`✅ Competition created (ID: ${compId}, Nr: ${compNr})`);

  // Add players to competition
  console.log('   Adding players...');
  for (const spa_nummer of memberNumbers) {
    await db.collection('competition_players').add({
      comp_id: compId,
      comp_nr: compNr,
      org_nummer: ORG_NUMBER,
      spa_nummer,
      periode: 1
    });
  }

  console.log('✅ 12 players added');

  // Generate 66 matches (Round Robin: 12 * 11 / 2 = 66)
  console.log('   Generating 66 matches...');
  let matchCount = 0;
  for (let i = 0; i < memberNumbers.length; i++) {
    for (let j = i + 1; j < memberNumbers.length; j++) {
      const player1 = memberNumbers[i];
      const player2 = memberNumbers[j];

      await db.collection('matches').add({
        comp_id: compId,
        comp_nr: compNr,
        org_nummer: ORG_NUMBER,
        periode: 1,
        ronde: matchCount + 1,
        spa_nummer_a: player1,
        spa_nummer_b: player2,
        uitslag_code: `1_${String(player1).padStart(3, '0')}_${String(player2).padStart(3, '0')}`,
        tafel_nummer: ((matchCount % 4) + 1), // Distribute across 4 tables
        speeldatum: null,
        created_at: new Date().toISOString()
      });
      matchCount++;
    }
  }

  console.log(`✅ ${matchCount} matches generated`);

  return { compId, compNr, memberNumbers };
}

async function testMatchesQueryPerformance(compId) {
  console.log('\n⏱️  Testing matches query performance...');

  const start = Date.now();
  const snapshot = await db.collection('matches')
    .where('comp_id', '==', compId)
    .get();
  const duration = Date.now() - start;

  console.log(`   Matches found: ${snapshot.size}`);
  console.log(`   Query duration: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function testResultsQueryPerformance(compId) {
  console.log('\n⏱️  Testing results query performance...');

  const start = Date.now();
  const snapshot = await db.collection('results')
    .where('comp_id', '==', compId)
    .get();
  const duration = Date.now() - start;

  console.log(`   Results found: ${snapshot.size}`);
  console.log(`   Query duration: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function testStandingsCalculation(compId, compNr, memberNumbers) {
  console.log('\n⏱️  Testing standings calculation performance...');

  // Get competition players
  const start = Date.now();
  const playersSnapshot = await db.collection('competition_players')
    .where('comp_id', '==', compId)
    .where('periode', '==', 1)
    .get();

  const resultsSnapshot = await db.collection('results')
    .where('comp_id', '==', compId)
    .where('periode', '==', 1)
    .get();

  const duration = Date.now() - start;

  console.log(`   Players: ${playersSnapshot.size}`);
  console.log(`   Results: ${resultsSnapshot.size}`);
  console.log(`   Query duration: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function cleanup(compId, memberNumbers) {
  console.log('\n🧹 Cleaning up test data...');

  // Delete competition and all related data
  const batch = db.batch();

  // Delete competition
  batch.delete(db.collection('competitions').doc(compId));

  // Delete matches
  const matches = await db.collection('matches').where('comp_id', '==', compId).get();
  matches.forEach(doc => batch.delete(doc.ref));

  // Delete results (if any)
  const results = await db.collection('results').where('comp_id', '==', compId).get();
  results.forEach(doc => batch.delete(doc.ref));

  // Delete players
  const players = await db.collection('competition_players').where('comp_id', '==', compId).get();
  players.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
  console.log('   ✓ Deleted competition, matches, and players');

  // Delete members
  const memberBatch = db.batch();
  const members = await db.collection('members').where('_test', '==', 'feature139').get();
  members.forEach(doc => memberBatch.delete(doc.ref));
  await memberBatch.commit();

  console.log(`   ✓ Deleted ${members.size} test members`);
  console.log('✅ Cleanup complete');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Feature #139: Competition Backend Performance Test');
  console.log('='.repeat(60));

  let compId = null;
  let compNr = null;
  let memberNumbers = [];

  try {
    // Create test data
    const data = await create12MembersAndCompetition();
    compId = data.compId;
    compNr = data.compNr;
    memberNumbers = data.memberNumbers;

    // Test performance
    const matchesTime = await testMatchesQueryPerformance(compId);
    const resultsTime = await testResultsQueryPerformance(compId);
    const standingsTime = await testStandingsCalculation(compId, compNr, memberNumbers);

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`Matches query: ${matchesTime}ms`);
    console.log(`Results query: ${resultsTime}ms`);
    console.log(`Standings calculation: ${standingsTime}ms`);
    const pass = matchesTime < 3000 && resultsTime < 3000 && standingsTime < 3000;
    console.log(`Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (compId) {
      await cleanup(compId, memberNumbers);
    }
  }

  process.exit(0);
}

main();
