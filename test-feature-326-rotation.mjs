#!/usr/bin/env node

/**
 * Test script for Feature #326 - Backup Rotation
 *
 * Creates 6 backups and verifies that only the last 5 are kept
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3004';
const BACKUP_SECRET = process.env.BACKUP_CRON_SECRET;

console.log('=== Feature #326: Backup Rotation Test ===\n');

async function createBackup() {
  const response = await fetch(`${BASE_URL}/api/backup/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BACKUP_SECRET}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Backup failed: ${response.status}`);
  }

  return await response.json();
}

async function listBackups() {
  // We need to be authenticated to list backups
  // For now, we'll use a direct check via the setup script
  const { Storage } = await import('@google-cloud/storage');

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const credentials = JSON.parse(serviceAccountKey);
  const storage = new Storage({
    projectId: credentials.project_id,
    credentials: credentials,
  });

  const bucketName = process.env.BACKUP_BUCKET_NAME || 'backupclubmatch';
  const bucket = storage.bucket(bucketName);

  const [files] = await bucket.getFiles({ prefix: 'backup-' });

  const backupDirs = new Set();
  for (const file of files) {
    const match = file.name.match(/^(backup-[^/]+)\//);
    if (match) {
      backupDirs.add(match[1]);
    }
  }

  return Array.from(backupDirs).sort();
}

async function runTest() {
  try {
    // Check current backup count
    console.log('Checking current backups...');
    let backups = await listBackups();
    console.log(`Current backup count: ${backups.length}`);
    console.log('');

    // Create backups until we have at least 6
    console.log('Creating backups to test rotation...');
    let backupsCreated = 0;

    while (backups.length + backupsCreated < 6) {
      console.log(`Creating backup ${backupsCreated + 1}...`);
      const result = await createBackup();
      console.log(`  ✅ Created: ${result.backupName}`);
      backupsCreated++;

      // Small delay between backups to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('');
    console.log(`Created ${backupsCreated} new backups`);
    console.log('');

    // Check final backup count
    console.log('Checking final backup count after rotation...');
    backups = await listBackups();
    console.log(`Final backup count: ${backups.length}`);
    console.log('');

    // List all backups
    console.log('Backups in storage:');
    backups.forEach((backup, i) => {
      console.log(`  ${i + 1}. ${backup}`);
    });
    console.log('');

    // Verify rotation worked (max 5 backups)
    if (backups.length <= 5) {
      console.log('✅ Backup rotation working correctly!');
      console.log(`   Only ${backups.length} backups are kept (max 5)`);
      console.log('');
      console.log('=== Test Passed ===');
    } else {
      console.error(`❌ Backup rotation failed!`);
      console.error(`   Found ${backups.length} backups (expected max 5)`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

runTest();
