#!/usr/bin/env node
import { db } from './src/lib/firebase-admin.ts';

(async () => {
  try {
    const orgs = await db.collection('ClubMatch/data/organizations')
      .where('org_wl_email', '==', 'p@de-boer.net')
      .get();

    if (orgs.empty) {
      console.log('No admin org found');
    } else {
      orgs.forEach(doc => {
        const data = doc.data();
        console.log('Org:', data.org_nummer, 'Login code:', data.login_code);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
