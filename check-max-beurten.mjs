#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const envContent = readFileSync('./.env.local', 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
const serviceAccountKey = JSON.parse(match[1]);
admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) });
const db = admin.firestore();

const comps = await db.collection('ClubMatch/data/competitions').where('org_nummer', '==', '1205').get();
console.log('Competitions for org 1205:');
comps.forEach(doc => {
  const data = doc.data();
  console.log(`Comp #${data.comp_nr}: ${data.comp_naam} - max_beurten: ${data.max_beurten || 0}, vast_beurten: ${data.vast_beurten || 0}`);
});
process.exit(0);
