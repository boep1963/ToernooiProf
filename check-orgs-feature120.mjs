import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./.data/firebase-service-account.json', 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const orgsSnapshot = await db.collection('organizations').limit(5).get();
console.log('Organizations in database:');
orgsSnapshot.forEach(doc => {
  const data = doc.data();
  console.log('- org_nummer:', data.org_nummer, '| org_code:', data.org_code, '| date_inlog:', data.date_inlog);
});

process.exit(0);
