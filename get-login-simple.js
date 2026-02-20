const admin = require('firebase-admin');

const serviceAccount = require('./.env.local.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
  try {
    const snapshot = await db.collection('organizations').limit(1).get();
    if (snapshot.empty) {
      console.log('No organizations found');
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log('Login code:', data.login_code);
    console.log('Org number:', data.org_nummer);
    console.log('Org name:', data.org_naam);
    console.log('Email:', data.org_wl_email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
