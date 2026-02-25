#!/usr/bin/env node
import 'dotenv/config';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}

const db = admin.firestore();

async function getLoginCode() {
  try {
    const orgsSnapshot = await db.collection('organizations').limit(1).get();

    if (orgsSnapshot.empty) {
      console.log('No organizations found');
      return;
    }

    const org = orgsSnapshot.docs[0].data();
    console.log('Login Code:', org.org_code);
    console.log('Organization:', org.org_naam);
    console.log('Org Number:', org.org_nummer);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getLoginCode();
