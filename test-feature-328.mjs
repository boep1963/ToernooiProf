#!/usr/bin/env node
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env.local') });

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function findTestUsers() {
  console.log('\n=== Finding Test Users for Feature #328 ===\n');

  // Get all organizations
  const orgsSnapshot = await db.collection('organizations').limit(10).get();

  console.log('Organizations found:');
  orgsSnapshot.forEach(doc => {
    const data = doc.data();
    const isAdmin = data.org_wl_email?.includes('@de-boer.net') || data.org_wl_email === 'hanseekels@gmail.com';
    console.log(`- Org ${data.org_nummer}: ${data.org_naam}`);
    console.log(`  Email: ${data.org_wl_email}`);
    console.log(`  Login code: ${data.org_login_code}`);
    console.log(`  Is Super Admin: ${isAdmin ? 'YES' : 'NO'}`);
    console.log('');
  });
}

findTestUsers().catch(console.error);
