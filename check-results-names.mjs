#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(await fs.promises.readFile('./.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const resultsSnap = await db.collection('results')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .limit(10)
  .get();

console.log('Total results in query:', resultsSnap.size);
let missingNames = 0;
resultsSnap.docs.forEach(doc => {
  const data = doc.data();
  const missing = !data.sp_1_naam || !data.sp_2_naam;
  if (missing) missingNames++;
  console.log('Result:', doc.id, 'sp_1_naam:', data.sp_1_naam || 'MISSING', 'sp_2_naam:', data.sp_2_naam || 'MISSING');
});

console.log('\nResults missing names:', missingNames, '/', resultsSnap.size);

await admin.app().delete();
