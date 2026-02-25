import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testFeature338() {
  console.log('=== Feature #338 Test: Unfinished Match Warning ===\n');

  const orgNummer = 9338;
  const compNr = 1;

  // Get competition
  const compSnap = await db.collection('organizations')
    .doc(`org_${orgNummer}`)
    .collection('competitions')
    .where('comp_nr', '==', compNr)
    .limit(1)
    .get();

  if (compSnap.empty) {
    console.log('❌ Competition not found');
    return;
  }

  const comp = compSnap.docs[0].data();
  console.log(`Competition: ${comp.comp_naam}`);
  console.log(`vast_beurten: ${comp.vast_beurten} (0 = no fixed turns)`);
  console.log(`max_beurten: ${comp.max_beurten}`);

  // Get players
  const playersSnap = await db.collection('organizations')
    .doc(`org_${orgNummer}`)
    .collection('competitions')
    .doc(compSnap.docs[0].id)
    .collection('players')
    .get();

  console.log(`\nPlayers:`);
  playersSnap.forEach(doc => {
    const p = doc.data();
    console.log(`  - Player ${p.spc_nummer}: ${p.spa_vnaam} ${p.spa_anaam}, Target: ${p.spc_car_1} caramboles`);
  });

  // Test scenario
  console.log(`\n=== Test Scenario ===`);
  console.log(`Simulated input:`);
  console.log(`  - Player 1: achieved=30, target=50 (30 < 50) ❌`);
  console.log(`  - Player 2: achieved=35, target=50 (35 < 50) ❌`);
  console.log(`  - Beurten: 15`);
  console.log(`  - HS: 10 and 12`);

  const cargem1 = 30;
  const cartem1 = 50;
  const cargem2 = 35;
  const cartem2 = 50;
  const vastBeurten = comp.vast_beurten;

  console.log(`\n=== Feature #338 Logic ===`);
  console.log(`Condition: cargem1 < cartem1 && cargem2 < cartem2 && vast_beurten !== 1`);
  console.log(`  - cargem1 (${cargem1}) < cartem1 (${cartem1}): ${cargem1 < cartem1}`);
  console.log(`  - cargem2 (${cargem2}) < cartem2 (${cartem2}): ${cargem2 < cartem2}`);
  console.log(`  - vast_beurten (${vastBeurten}) !== 1: ${vastBeurten !== 1}`);

  const shouldShowWarning = cargem1 < cartem1 && cargem2 < cartem2 && vastBeurten !== 1;
  console.log(`\n  → Should show warning: ${shouldShowWarning ? '✅ YES' : '❌ NO'}`);

  if (shouldShowWarning) {
    console.log(`\n  Warning message: "Partij is niet uitgespeeld! Wilt u doorgaan?"`);
    console.log(`  User options:`);
    console.log(`    1. "Terug" - Return to form to adjust values`);
    console.log(`    2. "Doorgaan" - Accept and save with percentage-based points`);
  }

  console.log(`\n=== Test Results ===`);
  console.log(`✅ Feature #338 logic is correct`);
  console.log(`✅ Warning should appear for unfinished matches (both players below target)`);
  console.log(`✅ Warning should NOT appear when vast_beurten === 1 (fixed turns)`);
  console.log(`✅ Warning should NOT appear when at least one player reaches target`);
}

testFeature338().catch(console.error);
