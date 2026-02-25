#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

// 1. Get the org by ID to see all fields
console.log('1. Getting org by ID:');
const orgDoc = await db.collection('organizations').doc('9337').get();
if (orgDoc.exists) {
  console.log(JSON.stringify(orgDoc.data(), null, 2));
} else {
  console.log('Org does not exist');
}

console.log('\n2. Querying by org_code (like the login API does):');
const code = '9337_F337TEST';
const orgSnapshot = await db.collection('organizations')
  .where('org_code', '==', code)
  .limit(1)
  .get();

if (orgSnapshot.empty) {
  console.log('❌ No organization found with org_code =', code);
} else {
  console.log('✅ Found organization:');
  console.log(JSON.stringify(orgSnapshot.docs[0].data(), null, 2));
}

process.exit(0);
