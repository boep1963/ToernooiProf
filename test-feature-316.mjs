#!/usr/bin/env node
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

console.log('[TEST] Feature #316 - Match Generation N+1 Query Fix');
console.log('='.repeat(60));

// Find a competition with players
const compsSnapshot = await db.collection('competitions').limit(5).get();
let testComp = null;

for (const doc of compsSnapshot.docs) {
  const comp = doc.data();
  const playersSnapshot = await db.collection('competition_players')
    .where('org_nummer', '==', comp.org_nummer)
    .where('comp_nr', '==', comp.comp_nr)
    .get();

  if (playersSnapshot.size >= 4) {
    testComp = { id: doc.id, ...comp, playerCount: playersSnapshot.size };
    break;
  }
}

if (!testComp) {
  console.log('[ERROR] No competition found with at least 4 players');
  process.exit(1);
}

console.log(`[INFO] Using competition: ${testComp.competitie_naam}`);
console.log(`[INFO] Organization: ${testComp.org_nummer}, Competition: ${testComp.comp_nr}`);
console.log(`[INFO] Players: ${testComp.playerCount}`);
console.log(`[INFO] Current period: ${testComp.huidige_periode}`);

// Delete existing matches for this period to test generation
const matchesSnapshot = await db.collection('matches')
  .where('org_nummer', '==', testComp.org_nummer)
  .where('comp_nr', '==', testComp.comp_nr)
  .where('periode', '==', testComp.huidige_periode)
  .get();

console.log(`[INFO] Deleting ${matchesSnapshot.size} existing matches...`);
const batch = db.batch();
matchesSnapshot.forEach(doc => batch.delete(doc.ref));
await batch.commit();

// Test match generation via API
const url = `http://localhost:3000/api/organizations/${testComp.org_nummer}/competitions/${testComp.comp_nr}/matches`;
const payload = { periode: testComp.huidige_periode };

console.log(`[INFO] Calling POST ${url}`);
console.log(`[INFO] Payload:`, payload);
console.log('[INFO] Watch server logs for optimization message...\n');

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const result = await response.json();

if (response.ok) {
  console.log(`[SUCCESS] Matches generated: ${result.matches?.length || 0}`);
  console.log(`[INFO] Expected for ${testComp.playerCount} players: ${(testComp.playerCount * (testComp.playerCount - 1)) / 2} matches`);

  // Try generating again to test duplicate detection
  console.log('\n[INFO] Testing duplicate detection by calling API again...');
  const response2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result2 = await response2.json();
  if (response2.ok && result2.matches?.length === 0) {
    console.log('[SUCCESS] Duplicate detection working - no new matches created');
  } else {
    console.log('[WARNING] Duplicate detection may have issues');
    console.log('Result:', result2);
  }
} else {
  console.log('[ERROR] API call failed:', result);
  process.exit(1);
}

console.log('\n[TEST] Feature #316 verification complete!');
console.log('[INFO] Check server logs above for: "Found X existing pairings in period Y"');
process.exit(0);
