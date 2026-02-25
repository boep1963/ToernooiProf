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

async function setLoginCode() {
  try {
    const orgsSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', 9338)
      .limit(1)
      .get();

    if (orgsSnapshot.empty) {
      console.log('No org found with org_nummer = 9338');
      return;
    }

    const orgDoc = orgsSnapshot.docs[0];
    const loginCode = '9338_F343TEST';

    await orgDoc.ref.update({
      org_wl_code: loginCode
    });

    console.log(`✅ Login code set: ${loginCode}`);
  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

setLoginCode();
