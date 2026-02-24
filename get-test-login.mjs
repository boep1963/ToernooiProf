#!/usr/bin/env node
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function getLoginCode() {
  const snapshot = await db.collection('organizations').limit(1).get();
  if (!snapshot.empty) {
    const org = snapshot.docs[0].data();
    console.log(`Login code: ${org.spa_code}`);
    console.log(`Org name: ${org.spa_naam}`);
    console.log(`Org number: ${org.spa_nummer}`);
  } else {
    console.log('No organizations found');
  }
  process.exit(0);
}

getLoginCode();
