import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://clubmatch-f4df7.firebaseio.com',
  });
}

const db = admin.firestore();

try {
  const orgsSnapshot = await db.collection('ClubMatch/data/organizations')
    .where('org_wl_email', '==', 'emailqueue@test.local')
    .limit(1)
    .get();

  if (orgsSnapshot.empty) {
    console.log('No organization found');
    process.exit(1);
  }

  const orgData = orgsSnapshot.docs[0].data();
  console.log('Verification code:', orgData.verification_code);
  console.log('Org nummer:', orgData.org_nummer);
  console.log('Login code:', orgData.org_code);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
