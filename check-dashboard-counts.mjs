#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./.data/serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

(async () => {
  try {
    // Count matches for org 1000
    const matchesSnapshot = await db.collection('ClubMatch/data/matches')
      .where('org_nummer', '==', 1000)
      .get();

    console.log('✓ Matches for org 1000:', matchesSnapshot.size);

    // Count tables for org 1000
    const tablesSnapshot = await db.collection('ClubMatch/data/tables')
      .where('org_nummer', '==', 1000)
      .get();

    console.log('✓ Tables for org 1000:', tablesSnapshot.size);

    // Count members for org 1000
    const membersSnapshot = await db.collection('ClubMatch/data/members')
      .where('spa_org', '==', 1000)
      .get();

    console.log('✓ Members for org 1000:', membersSnapshot.size);

    // Count competitions for org 1000
    const compsSnapshot = await db.collection('ClubMatch/data/competitions')
      .where('org_nummer', '==', 1000)
      .get();

    console.log('✓ Competitions for org 1000:', compsSnapshot.size);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
