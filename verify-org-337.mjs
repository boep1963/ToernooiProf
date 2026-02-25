#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

// Get the org to verify fields
const orgDoc = await db.collection('organizations').doc('9337').get();

if (orgDoc.exists) {
  console.log('Organization data:', JSON.stringify(orgDoc.data(), null, 2));
} else {
  console.log('Organization does not exist');
}

process.exit(0);
