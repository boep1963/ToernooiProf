#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([^']+)'/);
if (!serviceAccountMatch) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountMatch[1]);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function setupTest() {
  const orgNummer = 9337;
  const loginCode = `${orgNummer}_F337TEST`;

  console.log('🔧 Setting up test data for Feature #337...');

  // 1. Create organization
  await db.collection('organizations').doc(String(orgNummer)).set({
    org_nummer: orgNummer,
    org_naam: 'Test Org Feature 337',
    org_login_code: loginCode,
    org_wl_email: 'test337@example.com',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`✅ Created organization ${orgNummer}`);

  // 2. Create a simple competition (Libre, discipline 1)
  const compRef = await db.collection('organizations').doc(String(orgNummer))
    .collection('competitions').add({
      org_nummer: orgNummer,
      cmp_omsch: 'Test Libre Feature 337',
      cmp_nummer: 1,
      discipline: 1,  // Libre
      punten_sys: 3,  // Belgian system
      max_beurten: 25,
      vast_beurten: 0,  // Not fixed turns
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

  const compId = compRef.id;
  console.log(`✅ Created competition ${compId}`);

  // 3. Create two players
  const player1Ref = await db.collection('organizations').doc(String(orgNummer))
    .collection('players').add({
      org_nummer: orgNummer,
      spa_vnaam: 'Test',
      spa_anaam: 'PlayerA',
      spa_tv: '',
      spc_car_1: 30,  // moyenne for Libre
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

  const player2Ref = await db.collection('organizations').doc(String(orgNummer))
    .collection('players').add({
      org_nummer: orgNummer,
      spa_vnaam: 'Test',
      spa_anaam: 'PlayerB',
      spa_tv: '',
      spc_car_1: 30,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log(`✅ Created players ${player1Ref.id} and ${player2Ref.id}`);

  // 4. Link players to competition
  await db.collection('organizations').doc(String(orgNummer))
    .collection('competitions').doc(compId)
    .collection('players').doc(player1Ref.id).set({
      org_nummer: orgNummer,
      cmp_nummer: 1,
      player_ref: player1Ref,
      spc_nummer: 1,
      spc_car_1: 30
    });

  await db.collection('organizations').doc(String(orgNummer))
    .collection('competitions').doc(compId)
    .collection('players').doc(player2Ref.id).set({
      org_nummer: orgNummer,
      cmp_nummer: 1,
      player_ref: player2Ref,
      spc_nummer: 2,
      spc_car_1: 30
    });

  console.log(`✅ Linked players to competition`);

  // 5. Create a match
  await db.collection('organizations').doc(String(orgNummer))
    .collection('competitions').doc(compId)
    .collection('matches').add({
      org_nummer: orgNummer,
      cmp_nummer: 1,
      wp_speler1: 1,
      wp_speler2: 2,
      wp_periode: 1,
      wp_wed: 1,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log(`✅ Created match between players`);

  console.log('\n📋 Test Setup Complete!');
  console.log(`Login Code: ${loginCode}`);
  console.log(`Org Number: ${orgNummer}`);
  console.log(`Competition ID: ${compId}`);
  console.log(`URL: http://localhost:3000/competities/${compId}/matrix`);

  process.exit(0);
}

setupTest().catch(console.error);
