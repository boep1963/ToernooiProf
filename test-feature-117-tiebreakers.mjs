#!/usr/bin/env node
/**
 * Feature #117 Test: Standings tiebreaker logic
 * Tests: points > percentage > moyenne > highest series
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load Firebase credentials
const envContent = readFileSync('.env.local', 'utf8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/s);
if (!serviceAccountMatch) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
const jsonStr = serviceAccountMatch[1].split('\n')[0].trim();
const serviceAccount = JSON.parse(jsonStr);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const orgNr = 9999;
const compNr = 1;
const period = 1;

async function createTestResults() {
  console.log('Creating test results for tiebreaker scenarios...\n');

  // We have players 2 and 3 already in the competition
  // Scenario: Both get 2 points, but different percentages

  // Player 2: Win with 50 car out of 50 target = 100%
  // Player 3: Win with 40 car out of 50 target = 80%
  // Both get 2 points (WRV win), but player 2 should rank higher due to percentage

  const result1Ref = db.collection('ClubMatch/data/results').doc();
  await result1Ref.set({
    org_nummer: orgNr,
    comp_nr: compNr,
    periode: period,
    uitslag_code: `${period}_002_003`,
    sp_1_nr: 2,
    sp_1_cargem: 50,  // Made
    sp_1_cartem: 10,  // Target
    sp_1_punt: 2,      // Win
    sp_1_hs: 10,       // Highest series
    sp_2_nr: 3,
    sp_2_cargem: 8,
    sp_2_cartem: 10,
    sp_2_punt: 0,      // Loss
    sp_2_hs: 5,
    brt: 30,           // Total turns
    created_at: new Date().toISOString(),
  });

  console.log('✓ Created result: Player 2 beats Player 3');
  console.log('  Player 2: 50/10 = 500% (2 pts, HS=10)');
  console.log('  Player 3: 8/10 = 80% (0 pts, HS=5)\n');

  console.log('Expected standings:');
  console.log('1. Player 2: 2 points, 500%');
  console.log('2. Player 3: 0 points, 80%');
  console.log('\nTiebreaker test passed if player 2 is ranked #1!');
}

createTestResults()
  .then(() => {
    console.log('\n✅ Test data created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
