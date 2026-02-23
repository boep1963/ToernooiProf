#!/usr/bin/env node
import admin from './src/lib/firebase-admin.js';

const db = admin.firestore();

async function checkPlayerPeriods() {
  // Get the most recently added player for org 1205, competition 3
  const snapshot = await db.collection('competition_players')
    .where('spc_org', '==', 1205)
    .where('spc_competitie', '==', 3)
    .where('spc_nummer', '==', 2)
    .get();

  if (snapshot.empty) {
    console.log('No player found with spc_nummer=2 in org 1205, comp 3');
    return;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  console.log('Player found:', doc.id);
  console.log('Created at:', data.created_at);
  console.log('\nPeriod moyennes:');
  console.log('Period 1:', data.spc_moyenne_1);
  console.log('Period 2:', data.spc_moyenne_2);
  console.log('Period 3:', data.spc_moyenne_3);
  console.log('Period 4:', data.spc_moyenne_4);
  console.log('Period 5:', data.spc_moyenne_5);
  console.log('\nPeriod caramboles:');
  console.log('Period 1:', data.spc_car_1);
  console.log('Period 2:', data.spc_car_2);
  console.log('Period 3:', data.spc_car_3);
  console.log('Period 4:', data.spc_car_4);
  console.log('Period 5:', data.spc_car_5);
}

checkPlayerPeriods().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
