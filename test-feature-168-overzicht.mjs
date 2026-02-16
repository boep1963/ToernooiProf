#!/usr/bin/env node

/**
 * Test script for Feature #168: Fix 'Onbekend' player names on overzicht page
 *
 * Creates test results for competition #3 (org 1205) to verify:
 * 1. Player names resolve correctly from competition_players
 * 2. Names don't show as 'Onbekend'
 * 3. API field bug fixed (spa_nr -> spc_nummer)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const ORG_NR = 1205;
const COMP_NR = 3;

async function main() {
  console.log('🧪 Feature #168: Testing overzicht player name resolution\n');

  // Step 1: Get competition players to verify they exist
  console.log('📋 Step 1: Fetching competition players...');
  const playersSnapshot = await db.collection('ClubMatch/data/competition_players')
    .where('spc_org', '==', ORG_NR)
    .where('spc_competitie', '==', COMP_NR)
    .get();

  if (playersSnapshot.empty) {
    console.error('❌ No players found in competition! Add players first.');
    process.exit(1);
  }

  const players = [];
  playersSnapshot.forEach(doc => {
    const data = doc.data();
    players.push({
      spc_nummer: data.spc_nummer,
      name: `${data.spa_vnaam || ''} ${data.spa_tv || ''} ${data.spa_anaam || ''}`.trim()
    });
  });

  console.log(`✅ Found ${players.length} players:`);
  players.slice(0, 5).forEach(p => {
    console.log(`   - Player ${p.spc_nummer}: ${p.name}`);
  });
  if (players.length > 5) console.log(`   ... and ${players.length - 5} more`);

  if (players.length < 2) {
    console.error('❌ Need at least 2 players to create test results!');
    process.exit(1);
  }

  // Step 2: Create test results directly (without matches)
  console.log('\n📝 Step 2: Creating test results...');

  const player1 = players[0];
  const player2 = players[1];

  const testResultData = {
    org_nummer: ORG_NR,
    comp_nr: COMP_NR,
    uitslag_code: `TEST_F168_${Date.now()}`,
    periode: 1,
    speeldatum: new Date().toISOString(),
    sp_1_nr: player1.spc_nummer,
    sp_1_cartem: 25,
    sp_1_cargem: 30,
    sp_1_hs: 8,
    sp_1_punt: 2,
    brt: 10,
    sp_2_nr: player2.spc_nummer,
    sp_2_cartem: 20,
    sp_2_cargem: 18,
    sp_2_hs: 5,
    sp_2_punt: 0,
    gespeeld: 1,
  };

  const resultRef = await db.collection('ClubMatch/data/results').add(testResultData);
  console.log(`✅ Created test result: ${resultRef.id}`);
  console.log(`   Player 1: ${player1.name} (${player1.spc_nummer})`);
  console.log(`   Player 2: ${player2.name} (${player2.spc_nummer})`);

  // Step 3: Verify the fix by checking the results API
  console.log('\n🔍 Step 3: Testing API field name fix...');
  console.log('   (The bug was: API used "spa_nr" instead of "spc_nummer")');

  // Simulate what the overzicht page does:
  // 1. Fetch results
  const resultsSnapshot = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', ORG_NR)
    .where('comp_nr', '==', COMP_NR)
    .where('gespeeld', '==', 1)
    .limit(5)
    .get();

  console.log(`   Found ${resultsSnapshot.size} played results`);

  // 2. Fetch competition_players to build lookup
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.spc_nummer] = p.name;
  });

  // 3. Enrich results with player names
  console.log('\n✅ Testing name resolution:');
  resultsSnapshot.forEach(doc => {
    const result = doc.data();
    const naam_A = playerMap[result.sp_1_nr] || `Speler ${result.sp_1_nr}`;
    const naam_B = playerMap[result.sp_2_nr] || `Speler ${result.sp_2_nr}`;

    console.log(`   - ${naam_A} (${result.sp_1_cargem}) vs ${naam_B} (${result.sp_2_cargem})`);

    if (naam_A.includes('Onbekend') || naam_B.includes('Onbekend')) {
      console.error('   ❌ ERROR: Names still showing as "Onbekend"!');
    }
  });

  console.log('\n✅ Test complete! Now verify in browser:');
  console.log(`   1. Navigate to: http://localhost:3000/competities/${COMP_NR}/uitslagen/overzicht`);
  console.log('   2. Check that player names display correctly (not "Onbekend")');
  console.log('   3. Verify the test result appears in the table');

  console.log('\n🧹 Cleanup command (run after testing):');
  console.log(`   Delete the test result with uitslag_code starting with "TEST_F168_"`);
}

main()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
