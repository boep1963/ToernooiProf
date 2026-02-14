import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const app = admin.apps[0] || admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});

const db = admin.firestore();

const snap = await db.collection('verification_codes')
  .where('email', '==', 'feature80@test.nl')
  .orderBy('created_at', 'desc')
  .limit(1)
  .get();

if (!snap.empty) {
  console.log('Code:', snap.docs[0].data().code);
} else {
  console.log('No code found');
}

process.exit(0);
