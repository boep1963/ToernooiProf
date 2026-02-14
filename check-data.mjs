import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./clubmatch-firebase-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
  // Check competitions
  const compsSnap = await db.collection('ClubMatch/data/competitions')
    .where('org_nummer', '==', 1205)
    .get();

  console.log('Competitions:', compsSnap.size);
  compsSnap.forEach(doc => {
    const data = doc.data();
    console.log('  -', data.comp_nr, data.comp_naam);
  });

  // Check members
  const membersSnap = await db.collection('ClubMatch/data/members')
    .where('org_nummer', '==', 1205)
    .get();

  console.log('Members:', membersSnap.size);

  // Check matches
  const matchesSnap = await db.collection('ClubMatch/data/matches')
    .where('org_nummer', '==', 1205)
    .get();

  console.log('Matches:', matchesSnap.size);

  // Check results
  const resultsSnap = await db.collection('ClubMatch/data/results')
    .where('org_nummer', '==', 1205)
    .get();

  console.log('Results:', resultsSnap.size);
  resultsSnap.forEach(doc => {
    const data = doc.data();
    console.log('  -', data.uitslag_code, 'Player 1:', data.sp_1_cargem, 'Player 2:', data.sp_2_cargem);
  });

  process.exit(0);
}

checkData().catch(console.error);
