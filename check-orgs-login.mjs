#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
if (!serviceAccountMatch) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountMatch[1]);
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const snap = await db.collection('organizations').get();
console.log('=== Organizations ===');
snap.docs.forEach(doc => {
  const d = doc.data();
  console.log('org_nummer:', d.org_nummer, '| org_code:', d.org_code, '| naam:', d.org_naam);
});

// Check which competitions have matches
console.log('\n=== Competitions with matches ===');
const matchSnap = await db.collection('matches').get();
const compMap = {};
matchSnap.docs.forEach(doc => {
  const d = doc.data();
  const key = `org:${d.org_nummer}_comp:${d.comp_nr}`;
  if (!compMap[key]) compMap[key] = 0;
  compMap[key]++;
});
Object.entries(compMap).forEach(([key, count]) => {
  console.log(key, '- matches:', count);
});

process.exit(0);
