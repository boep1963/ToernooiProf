#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

// Update the org with correct field name for login
await db.collection('organizations').doc('9337').update({
  org_code: '9337_F337TEST'  // This is the field the login API expects
});

console.log('✅ Updated org with org_code field');
process.exit(0);
