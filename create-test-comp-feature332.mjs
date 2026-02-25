#!/usr/bin/env node
import 'dotenv/config';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK');
    console.error('Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set in .env.local');
    process.exit(1);
  }
}

const db = admin.firestore();

async function createTestCompetition() {
  try {
    // Get an organization to use
    const orgsSnapshot = await db.collection('organizations').limit(1).get();

    if (orgsSnapshot.empty) {
      console.log('No organizations found');
      process.exit(1);
    }

    const orgDoc = orgsSnapshot.docs[0];
    const org = orgDoc.data();
    console.log(`Using organization: ${org.org_naam} (${org.org_nummer})`);

    // Create a test competition with vast_beurten enabled
    const compRef = db.collection('competitions').doc();
    await compRef.set({
      org_nummer: org.org_nummer,
      comp_nr: 999, // Use a unique number
      comp_naam: 'Test Feature 332 - Vast Beurten',
      comp_datum: '25-02-2026',
      discipline: 1, // Libre
      periode: 1,
      punten_sys: 1, // WRV
      moy_form: 4, // x30
      min_car: 0,
      max_beurten: 30, // Fixed turns: 30
      vast_beurten: 1, // Enable fixed turns
      sorteren: 1,
    });

    console.log('✅ Test competition created:');
    console.log('   Name: Test Feature 332 - Vast Beurten');
    console.log('   Number: 999');
    console.log('   Vast Beurten: YES (enabled)');
    console.log('   Max Beurten: 30');
    console.log(`   Organization: ${org.org_nummer}`);
    console.log('');
    console.log('Now you can test at: http://localhost:3002/competities/999/matrix');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestCompetition();
