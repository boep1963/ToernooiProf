#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function getAnyOrg() {
  try {
    const orgsSnapshot = await db.collection('organizations')
      .limit(5)
      .get();

    if (orgsSnapshot.empty) {
      console.log('No organizations found');
      return;
    }

    console.log('Available organizations:');
    orgsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- Org ${data.org_nummer}: ${data.org_naam} (Login: ${data.org_wl_code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getAnyOrg();
