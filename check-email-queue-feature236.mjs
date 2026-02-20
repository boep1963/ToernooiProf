#!/usr/bin/env node

/**
 * Check email_queue collection for email_change entries
 * Feature #236 verification
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { initializeDb } from './src/lib/firebase-admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = await initializeDb();

async function checkEmailQueue() {
  console.log('Checking email_queue collection for email_change entries...\n');

  try {
    const emailQueueSnapshot = await db.collection('email_queue')
      .where('type', '==', 'email_change')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    if (emailQueueSnapshot.empty) {
      console.log('✗ No email_change entries found in email_queue');
      process.exit(0);
    }

    console.log(`✓ Found ${emailQueueSnapshot.size} email_change entry(ies):\n`);

    emailQueueSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Entry #${index + 1} (${doc.id}):`);
      console.log(`  Type: ${data.type}`);
      console.log(`  Org Number: ${data.org_nummer}`);
      console.log(`  Old Email: ${data.old_email}`);
      console.log(`  New Email: ${data.new_email}`);
      console.log(`  Created At: ${data.created_at}`);
      console.log(`  Processed: ${data.processed}`);
      console.log('');
    });

    console.log('✓ Feature #236 verification: email_queue entries exist!');

  } catch (error) {
    console.error('Error querying email_queue:', error);
  } finally {
    process.exit(0);
  }
}

checkEmailQueue();
