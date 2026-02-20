#!/usr/bin/env node
import { db } from './src/lib/firebase-admin.ts';

(async () => {
  const snapshot = await db.collection('ClubMatch/data/competitions')
    .where('comp_nr', '==', 5)
    .where('org_nummer', '==', 1205)
    .get();

  if (snapshot.empty) {
    console.log('Competition 5 not found');
  } else {
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Competition 5 data:');
      console.log('  comp_naam:', data.comp_naam);
      console.log('  comp_datum:', data.comp_datum);
      console.log('  comp_datum type:', typeof data.comp_datum);
    });
  }
})();
