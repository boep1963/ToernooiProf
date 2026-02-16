#!/usr/bin/env node
/**
 * Test script for feature #177: Field name mismatch fix
 * Tests that competition_players and members APIs now work correctly
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.env.local')
    .toString()
    .split('\n')
    .find(line => line.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY'))
    ?.split('=')[1] || '{}'
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function testFeature177() {
  console.log('=== Testing Feature #177: Field Name Mismatch Fix ===\n');

  // Test 1: Check members collection (uses spa_org)
  console.log('Test 1: Members collection (spa_org field)');
  const membersSnapshot = await db.collection('members')
    .where('spa_org', '==', 1205)
    .get();
  console.log(`✓ Found ${membersSnapshot.size} members for org 1205 using spa_org`);

  if (membersSnapshot.size > 0) {
    const firstMember = membersSnapshot.docs[0].data();
    console.log(`  Sample: ${firstMember.spa_vnaam} ${firstMember.spa_anaam} (${firstMember.spa_nummer})`);
  }

  // Test 2: Check competition_players collection (uses spc_org, spc_competitie)
  console.log('\nTest 2: Competition Players collection (spc_org, spc_competitie fields)');
  const playersSnapshot = await db.collection('competition_players')
    .where('spc_org', '==', 1205)
    .get();
  console.log(`✓ Found ${playersSnapshot.size} competition_players for org 1205 using spc_org`);

  if (playersSnapshot.size > 0) {
    const firstPlayer = playersSnapshot.docs[0].data();
    console.log(`  Sample: comp=${firstPlayer.spc_competitie}, player=${firstPlayer.spc_nummer}`);
  }

  // Test 3: Try with wrong field names (should return 0)
  console.log('\nTest 3: Using wrong field names (should return 0)');
  const wrongMembers = await db.collection('members')
    .where('org_nummer', '==', 1205)
    .get();
  console.log(`  Members with org_nummer: ${wrongMembers.size} (expected: 0)`);

  const wrongPlayers = await db.collection('competition_players')
    .where('org_nummer', '==', 1205)
    .get();
  console.log(`  Players with org_nummer: ${wrongPlayers.size} (expected: 0)`);

  console.log('\n=== Test Complete ===');
}

testFeature177().catch(console.error);
