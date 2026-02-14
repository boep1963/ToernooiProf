import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./.data/serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const snapshot = await db.collection('organizations').limit(1).get();
if (!snapshot.empty) {
  const doc = snapshot.docs[0];
  const data = doc.data();
  console.log('Login code:', data.org_login_code);
  console.log('Org nummer:', data.org_nummer);
  console.log('Org naam:', data.org_naam);
}
process.exit(0);
