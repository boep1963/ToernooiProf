#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccountKey = JSON.parse(readFileSync('./.env.local', 'utf8').match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.*)'/)[1]);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const db = admin.firestore();

const comp = await db.collection('ClubMatch/data/competitions').where('comp_nr', '==', 3).where('org_nummer', '==', '1205').get();

if (!comp.empty) {
  const data = comp.docs[0].data();
  console.log('Competition 3 data:');
  console.log('  comp_naam:', data.comp_naam);
  console.log('  periode:', data.periode);
  console.log('  comp_nr:', data.comp_nr);
} else {
  console.log('Competition 3 not found');
}

process.exit(0);
