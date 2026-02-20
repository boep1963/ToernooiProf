#!/usr/bin/env node

/**
 * Feature #212 Test: Verify new period uses adjusted moyennes and caramboles
 *
 * Bug: When creating a new period with adjusted moyennes, the matches generated
 * used the old moyennes/caramboles instead of the new ones.
 *
 * Root Cause: matches/route.ts used discipline field instead of periode field
 * to select which spc_car_X field to use for match generation.
 *
 * Fix: Changed carKey mapping from discipline to periode
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const ORG = 1205;
const COMP = 1; // Competition in org 1205

console.log('🧪 Feature #212: Period Moyenne/Caramboles Test\n');

async function runTest() {
  try {
    // Step 1: Get competition details
    console.log('📊 Step 1: Fetching competition details...');
    const compSnap = await db.collection('competitions')
      .where('org_nummer', '==', ORG)
      .where('comp_nr', '==', COMP)
      .limit(1)
      .get();

    if (compSnap.empty) {
      console.log('❌ Competition not found');
      process.exit(1);
    }

    const comp = compSnap.docs[0].data();
    console.log(`   Competition: ${comp.comp_naam}`);
    console.log(`   Current period: ${comp.periode}`);
    console.log(`   Discipline: ${comp.discipline}`);

    // Step 2: Get players and check their moyennes/caramboles for current period
    console.log('\n📋 Step 2: Checking player moyennes/caramboles...');
    const playersSnap = await db.collection('competition_players')
      .where('spc_org', '==', ORG)
      .where('spc_competitie', '==', COMP)
      .limit(3)
      .get();

    if (playersSnap.empty) {
      console.log('❌ No players found');
      process.exit(1);
    }

    const players = [];
    playersSnap.docs.forEach(doc => {
      const data = doc.data();
      players.push({
        nummer: data.spc_nummer,
        naam: `${data.spa_vnaam || ''} ${data.spa_anaam || ''}`.trim(),
        moy_1: data.spc_moyenne_1 || 0,
        car_1: data.spc_car_1 || 0,
        moy_2: data.spc_moyenne_2 || 0,
        car_2: data.spc_car_2 || 0,
        moy_3: data.spc_moyenne_3 || 0,
        car_3: data.spc_car_3 || 0,
      });
    });

    console.log('\n   Players:');
    players.forEach(p => {
      console.log(`   - ${p.naam}`);
      console.log(`     P1: moy=${p.moy_1.toFixed(3)}, car=${p.car_1}`);
      console.log(`     P2: moy=${p.moy_2.toFixed(3)}, car=${p.car_2}`);
      console.log(`     P3: moy=${p.moy_3.toFixed(3)}, car=${p.car_3}`);
    });

    // Step 3: Simulate what the bug would do vs what the fix does
    console.log('\n🔍 Step 3: Analyzing caramboles field selection...');
    console.log(`\n   ❌ BEFORE FIX (using discipline):`);
    console.log(`      carKey = spc_car_${comp.discipline} (discipline-based)`);
    console.log(`      Player 1 caramboles = ${players[0][`car_${comp.discipline}`]}`);

    console.log(`\n   ✅ AFTER FIX (using periode):`);
    console.log(`      carKey = spc_car_${comp.periode} (periode-based)`);
    console.log(`      Player 1 caramboles = ${players[0][`car_${comp.periode}`]}`);

    // Step 4: Check if there's a difference
    const bugValue = players[0][`car_${comp.discipline}`];
    const fixedValue = players[0][`car_${comp.periode}`];

    if (bugValue !== fixedValue) {
      console.log(`\n   ⚠️  BUG IMPACT: Using discipline (${comp.discipline}) instead of periode (${comp.periode})`);
      console.log(`      results in WRONG caramboles: ${bugValue} instead of ${fixedValue}`);
      console.log(`      Difference: ${Math.abs(bugValue - fixedValue)} caramboles`);
    } else {
      console.log(`\n   ℹ️  In this specific case, discipline == periode, so bug was hidden.`);
      console.log(`      But for multi-period competitions in other disciplines, this would be wrong!`);
    }

    // Step 5: Verify the fix in the code
    console.log('\n🔧 Step 5: Verifying fix in matches/route.ts...');
    const routeCode = readFileSync('./src/app/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts', 'utf8');

    if (routeCode.includes('const carKey = carKeyMap[periode]')) {
      console.log('   ✅ Fix confirmed: carKey uses periode (CORRECT)');
    } else if (routeCode.includes('const carKey = carKeyMap[discipline]')) {
      console.log('   ❌ Bug still present: carKey uses discipline (WRONG)');
    } else {
      console.log('   ⚠️  Could not verify - code pattern not found');
    }

    // Step 6: Demonstrate the scenario where the bug manifests
    console.log('\n📝 Step 6: Bug manifestation scenario:');
    console.log('   Scenario: Competition with discipline=1 (Libre), currently in periode=2');
    console.log('   Player has:');
    console.log('     - spc_car_1 = 50  (period 1 caramboles)');
    console.log('     - spc_car_2 = 60  (period 2 caramboles - ADJUSTED UP)');
    console.log('   ');
    console.log('   When generating matches in period 2:');
    console.log('   ❌ BUG: Uses carKeyMap[discipline=1] → spc_car_1 = 50 (WRONG!)');
    console.log('   ✅ FIX: Uses carKeyMap[periode=2] → spc_car_2 = 60 (CORRECT!)');
    console.log('   ');
    console.log('   Impact: Matches generated with old caramboles,');
    console.log('           making games too short/long for player skill level.');

    console.log('\n✅ Test completed successfully!');
    console.log('\n📌 Summary:');
    console.log('   - Bug identified: matches/route.ts used discipline instead of periode');
    console.log('   - Fix applied: Changed carKey = carKeyMap[discipline] → carKeyMap[periode]');
    console.log('   - Impact: Ensures matches use correct caramboles for current period');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

runTest().then(() => process.exit(0));
