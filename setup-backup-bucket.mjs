#!/usr/bin/env node

/**
 * Setup script for Cloud Storage bucket
 * Creates the 'backupclubmatch' bucket if it doesn't exist
 */

import { config } from 'dotenv';
import { Storage } from '@google-cloud/storage';

// Load environment variables from .env.local
config({ path: '.env.local' });

const BUCKET_NAME = process.env.BACKUP_BUCKET_NAME || 'backupclubmatch';

async function setupBucket() {
  try {
    console.log('=== Setting up Cloud Storage Bucket ===\n');

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not set');
      process.exit(1);
    }

    const credentials = JSON.parse(serviceAccountKey);
    const storage = new Storage({
      projectId: credentials.project_id,
      credentials: credentials,
    });

    console.log('Project ID:', credentials.project_id);
    console.log('Bucket name:', BUCKET_NAME);
    console.log('');

    // Check if bucket exists
    console.log('Checking if bucket exists...');
    const bucket = storage.bucket(BUCKET_NAME);

    try {
      const [exists] = await bucket.exists();

      if (exists) {
        console.log('✅ Bucket already exists:', BUCKET_NAME);

        // List any existing backups
        console.log('\nListing existing backups...');
        const [files] = await bucket.getFiles({ prefix: 'backup-' });

        const backupDirs = new Set();
        for (const file of files) {
          const match = file.name.match(/^(backup-[^/]+)\//);
          if (match) {
            backupDirs.add(match[1]);
          }
        }

        console.log(`Found ${backupDirs.size} existing backups in bucket`);
        if (backupDirs.size > 0) {
          Array.from(backupDirs).sort().forEach((backup, i) => {
            console.log(`  ${i + 1}. ${backup}`);
          });
        }
      } else {
        console.log('Bucket does not exist, creating...');

        // Create bucket with default settings
        await bucket.create({
          location: 'EUROPE-WEST1', // Change to your preferred region
          storageClass: 'STANDARD',
        });

        console.log('✅ Bucket created successfully:', BUCKET_NAME);
      }

      console.log('\n✅ Bucket setup complete!');
      console.log('You can now run backups using the /api/backup/run endpoint');
    } catch (error) {
      if (error.code === 409) {
        console.log('✅ Bucket already exists (owned by this project)');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('\n❌ Setup failed:');
    console.error(error.message);

    if (error.code === 403) {
      console.error('\nThe service account does not have permission to create buckets.');
      console.error('Please create the bucket manually in Google Cloud Console:');
      console.error(`  1. Go to https://console.cloud.google.com/storage/browser`);
      console.error(`  2. Click "Create Bucket"`);
      console.error(`  3. Name: ${BUCKET_NAME}`);
      console.error(`  4. Location: Choose your preferred region`);
      console.error(`  5. Storage class: Standard`);
    }

    process.exit(1);
  }
}

setupBucket();
