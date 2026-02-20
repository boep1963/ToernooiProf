#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
if (!serviceAccountMatch) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountMatch[1]);
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Get the latest competition (should be the one we just created)
const snap = await db.collection('competitions')
  .where('comp_naam', '==', 'Test WRV Bonussen Feature 219')
  .limit(1)
  .get();

if (snap.empty) {
  console.log('Competition not found!');
  process.exit(1);
}

const comp = snap.docs[0].data();
console.log('=== Competition Data ===');
console.log('Name:', comp.comp_naam);
console.log('punten_sys:', comp.punten_sys);
console.log('Expected: 11111 (WRV + bonus winst + remise + verlies)');
console.log('Match:', comp.punten_sys === 11111 ? '✅ CORRECT' : '❌ INCORRECT');

// Decode the value
const ps = comp.punten_sys;
const baseSystem = Math.floor(ps / 10000);
const digit2 = Math.floor((ps % 10000) / 1000);
const digit4 = Math.floor((ps % 100) / 10);
const digit5 = ps % 10;

console.log('\n=== Decoded punten_sys ===');
console.log('Base system:', baseSystem, '(1=WRV, 2=10-punten, 3=Belgisch)');
console.log('Digit 2 (bonus enabled):', digit2);
console.log('Digit 4 (remise bonus):', digit4);
console.log('Digit 5 (verlies bonus):', digit5);

console.log('\n=== Interpretation ===');
console.log('Bonus winst:', digit2 === 1 ? 'ENABLED (always when digit2=1)' : 'DISABLED');
console.log('Bonus remise:', digit4 === 1 ? 'ENABLED' : 'DISABLED');
console.log('Bonus verlies:', digit5 === 1 ? 'ENABLED' : 'DISABLED');

process.exit(0);
