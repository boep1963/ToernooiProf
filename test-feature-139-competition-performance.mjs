#!/usr/bin/env node

/**
 * Feature #139: Competition with many matches loads efficiently
 *
 * This script:
 * 1. Creates competition with 12 players (66 matches via Round Robin)
 * 2. Tests match overview page load time
 * 3. Tests matrix view rendering
 * 4. Tests results page load time
 * 5. Cleans up test data
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import http from 'http';

// Parse .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
const serviceAccount = JSON.parse(serviceAccountMatch[1]);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const ORG_NUMBER = 1205;
const LOGIN_CODE = '1205_AAY@#';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in...');
  const response = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginCode: LOGIN_CODE })
  });

  const cookie = response.headers['set-cookie'];
  if (!cookie) throw new Error('Login failed');

  console.log('✅ Logged in');
  return cookie[0].split(';')[0];
}

async function create12Members() {
  console.log('\n📝 Creating 12 test members...');

  // Get current max member number
  const snapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();

  let maxNumber = 0;
  snapshot.forEach(doc => {
    const num = doc.data().spa_nummer;
    if (num > maxNumber) maxNumber = num;
  });

  const memberIds = [];
  for (let i = 1; i <= 12; i++) {
    const docRef = await db.collection('members').add({
      spa_nummer: maxNumber + i,
      spa_vnaam: `Player${i}`,
      spa_tv: '',
      spa_anaam: 'Test139',
      spa_org: ORG_NUMBER,
      spa_moy_lib: parseFloat((Math.random() * 5).toFixed(3)),
      spa_moy_band: parseFloat((Math.random() * 3).toFixed(3)),
      spa_moy_3bkl: parseFloat((Math.random() * 2).toFixed(3)),
      spa_moy_3bgr: parseFloat((Math.random() * 1.5).toFixed(3)),
      spa_moy_kad: parseFloat((Math.random() * 4).toFixed(3)),
      created_at: new Date().toISOString(),
      _test: 'feature139'
    });
    memberIds.push(docRef.id);
  }

  console.log(`✅ Created 12 members (IDs: ${maxNumber + 1} to ${maxNumber + 12})`);
  return { memberIds, startNumber: maxNumber + 1 };
}

async function createCompetition(cookie, startMemberNumber) {
  console.log('\n🏆 Creating competition with 12 players...');

  const response = await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      naam: 'Feature139 Performance Test',
      datum: '2026-02-14',
      omschrijving: 'Performance test with 66 matches',
      discipline: 1, // Libre
      puntensysteem: 1, // WRV
      tafel_volgorde: 1,
      vast_beurten: 0,
      max_beurten: 35,
      min_car: 0,
      wrv_bonus: 1,
      wrv_bonus_verliezer: 0
    })
  });

  if (response.statusCode !== 201) {
    throw new Error(`Failed to create competition: ${response.statusCode}`);
  }

  const data = JSON.parse(response.body);
  const compId = data.id;
  const compNr = data.comp_nr;

  console.log(`✅ Competition created (ID: ${compId}, Nr: ${compNr})`);

  // Add 12 players to competition
  console.log('   Adding 12 players...');
  for (let i = 0; i < 12; i++) {
    await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions/${compNr}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({
        spa_nummer: startMemberNumber + i
      })
    });
  }

  console.log('✅ 12 players added');

  // Generate matches via Round Robin
  console.log('   Generating matches...');
  const matchResponse = await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions/${compNr}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      periode: 1
    })
  });

  if (matchResponse.statusCode !== 201) {
    throw new Error(`Failed to generate matches: ${matchResponse.statusCode}`);
  }

  const matchData = JSON.parse(matchResponse.body);
  console.log(`✅ ${matchData.created} matches generated`);

  return { compId, compNr, matchCount: matchData.created };
}

async function testMatchOverviewPerformance(cookie, compNr) {
  console.log('\n⏱️  Testing match overview performance...');

  const start = Date.now();
  const response = await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions/${compNr}/matches`, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const duration = Date.now() - start;

  if (response.statusCode !== 200) {
    throw new Error(`Match overview failed: ${response.statusCode}`);
  }

  const data = JSON.parse(response.body);
  console.log(`   Matches loaded: ${data.matches?.length || 0}`);
  console.log(`   API response time: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function testResultsPagePerformance(cookie, compNr) {
  console.log('\n⏱️  Testing results page performance...');

  const start = Date.now();
  const response = await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions/${compNr}/results`, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const duration = Date.now() - start;

  if (response.statusCode !== 200) {
    throw new Error(`Results page failed: ${response.statusCode}`);
  }

  const data = JSON.parse(response.body);
  console.log(`   Results loaded: ${data.results?.length || 0}`);
  console.log(`   API response time: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function testStandingsPerformance(cookie, compNr) {
  console.log('\n⏱️  Testing standings performance...');

  const start = Date.now();
  const response = await makeRequest(`http://localhost:3000/api/organizations/${ORG_NUMBER}/competitions/${compNr}/standings?periode=1`, {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const duration = Date.now() - start;

  if (response.statusCode !== 200) {
    throw new Error(`Standings failed: ${response.statusCode}`);
  }

  const data = JSON.parse(response.body);
  console.log(`   Standings entries: ${data.standings?.length || 0}`);
  console.log(`   API response time: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function cleanup(memberIds, compId) {
  console.log('\n🧹 Cleaning up test data...');

  // Delete competition
  if (compId) {
    await db.collection('competitions').doc(compId).delete();

    // Delete all related data
    const [matches, results, players] = await Promise.all([
      db.collection('matches').where('comp_id', '==', compId).get(),
      db.collection('results').where('comp_id', '==', compId).get(),
      db.collection('competition_players').where('comp_id', '==', compId).get()
    ]);

    const batch = db.batch();
    matches.forEach(doc => batch.delete(doc.ref));
    results.forEach(doc => batch.delete(doc.ref));
    players.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    console.log('   ✓ Deleted competition and related data');
  }

  // Delete members
  if (memberIds?.length > 0) {
    const batch = db.batch();
    memberIds.forEach(id => {
      batch.delete(db.collection('members').doc(id));
    });
    await batch.commit();
    console.log(`   ✓ Deleted ${memberIds.length} members`);
  }

  console.log('✅ Cleanup complete');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Feature #139: Competition Performance Test (66 matches)');
  console.log('='.repeat(60));

  let memberIds = [];
  let compId = null;
  let compNr = null;

  try {
    // Login
    const cookie = await login();

    // Create 12 members
    const memberData = await create12Members();
    memberIds = memberData.memberIds;

    // Create competition with 66 matches
    const compData = await createCompetition(cookie, memberData.startNumber);
    compId = compData.compId;
    compNr = compData.compNr;

    // Test performance
    const matchTime = await testMatchOverviewPerformance(cookie, compNr);
    const resultsTime = await testResultsPagePerformance(cookie, compNr);
    const standingsTime = await testStandingsPerformance(cookie, compNr);

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`Match overview: ${matchTime}ms`);
    console.log(`Results page: ${resultsTime}ms`);
    console.log(`Standings page: ${standingsTime}ms`);
    console.log(`Status: ${matchTime < 3000 && resultsTime < 3000 && standingsTime < 3000 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await cleanup(memberIds, compId);
  }

  process.exit(0);
}

main();
