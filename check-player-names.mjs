import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('.data/scoreboard-35372-firebase-adminsdk-fn6el-df665ddf77.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  const snapshot = await db.collection('competition_players')
    .where('spc_org', '==', 1000)
    .where('spc_competitie', '==', 1)
    .get();

  console.log('Total players:', snapshot.size);

  let emptyCount = 0;
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.spa_vnaam || !data.spa_anaam) {
      emptyCount++;
      console.log('Player', data.spc_nummer, '- empty name fields:',
        'vnaam:', !!data.spa_vnaam, 'anaam:', !!data.spa_anaam);
    }
  });

  console.log('Players with empty names:', emptyCount);
  process.exit(0);
})();
