/**
 * Firestore Backup and Restore Library for ToernooiProf
 *
 * Provides functions to:
 * - Export all Firestore collections to Cloud Storage as JSON
 * - Maintain max 5 backups with automatic rotation (FIFO)
 * - Generate metadata files with backup statistics
 * - Restore data from Cloud Storage backups
 */

import { Storage } from '@google-cloud/storage';
import { adminDb } from './firebase-admin';

const FIRESTORE_PREFIX = 'ToernooiProf/data';

export interface BackupMetadata {
  timestamp: string;
  collections: string[];
  totalDocuments: number;
  durationMs: number;
  size?: number;
}

export interface BackupListItem {
  name: string;
  timestamp: string;
  metadata?: BackupMetadata;
}

/**
 * Initialize Cloud Storage client using the same credentials as Firebase Admin
 */
function getStorageClient(): Storage {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  const credentials = JSON.parse(serviceAccountKey);

  return new Storage({
    projectId: credentials.project_id,
    credentials: credentials,
  });
}

/**
 * Get the backup bucket name from environment or use default
 */
function getBucketName(): string {
  return process.env.BACKUP_BUCKET_NAME || 'backupclubmatch';
}

/**
 * Read all documents from a Firestore collection
 */
async function exportCollection(collectionName: string): Promise<Record<string, unknown>[]> {
  const collectionPath = `${FIRESTORE_PREFIX}/${collectionName}`;
  const snapshot = await adminDb.collection(collectionPath).get();

  const documents: Record<string, unknown>[] = [];
  snapshot.forEach((doc) => {
    documents.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return documents;
}

/**
 * Create a full backup of all Firestore collections to Cloud Storage
 */
export async function createBackup(): Promise<{
  success: boolean;
  backupName: string;
  metadata: BackupMetadata;
  error?: string;
}> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const backupName = `backup-${timestamp}`;

  console.log(`[Backup] Starting backup: ${backupName}`);

  try {
    const storage = getStorageClient();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    // List of collections to back up
    const collectionsToBackup = [
      'organizations',
      'competitions',
      'members',
      'competition_players',
      'matches',
      'results',
      'tables',
      'device_config',
      'score_helpers',
      'score_helpers_tablet',
      'email_queue',
    ];

    let totalDocuments = 0;
    const backupedCollections: string[] = [];

    // Export each collection
    for (const collectionName of collectionsToBackup) {
      try {
        const documents = await exportCollection(collectionName);

        if (documents.length > 0) {
          // Write collection to Cloud Storage
          const fileName = `${backupName}/${collectionName}.json`;
          const file = bucket.file(fileName);

          await file.save(JSON.stringify(documents, null, 2), {
            contentType: 'application/json',
            metadata: {
              cacheControl: 'no-cache',
            },
          });

          totalDocuments += documents.length;
          backupedCollections.push(collectionName);
          console.log(`[Backup] Exported ${collectionName}: ${documents.length} documents`);
        } else {
          console.log(`[Backup] Skipped ${collectionName}: 0 documents`);
        }
      } catch (err) {
        console.error(`[Backup] Error exporting collection ${collectionName}:`, err);
        // Continue with other collections even if one fails
      }
    }

    // Generate metadata file
    const metadata: BackupMetadata = {
      timestamp,
      collections: backupedCollections,
      totalDocuments,
      durationMs: Date.now() - startTime,
    };

    const metadataFile = bucket.file(`${backupName}/_metadata.json`);
    await metadataFile.save(JSON.stringify(metadata, null, 2), {
      contentType: 'application/json',
    });

    console.log(`[Backup] Metadata saved: ${totalDocuments} documents in ${backupedCollections.length} collections`);

    // Clean up old backups (keep only last 5)
    await cleanupOldBackups(bucket);

    const durationSec = (Date.now() - startTime) / 1000;
    console.log(`[Backup] Completed in ${durationSec.toFixed(2)}s`);

    return {
      success: true,
      backupName,
      metadata,
    };
  } catch (error) {
    console.error('[Backup] Failed:', error);
    return {
      success: false,
      backupName,
      metadata: {
        timestamp,
        collections: [],
        totalDocuments: 0,
        durationMs: Date.now() - startTime,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up old backups, keeping only the last 5
 */
async function cleanupOldBackups(bucket: any): Promise<void> {
  try {
    console.log('[Backup] Checking for old backups to clean up...');

    // List all backup directories
    const [files] = await bucket.getFiles({ prefix: 'backup-' });

    // Extract unique backup names (directories)
    const backupDirs = new Set<string>();
    for (const file of files) {
      const match = file.name.match(/^(backup-[^/]+)\//);
      if (match) {
        backupDirs.add(match[1]);
      }
    }

    const backups = Array.from(backupDirs).sort().reverse(); // Sort newest first

    console.log(`[Backup] Found ${backups.length} existing backups`);

    // If we have more than 5 backups, delete the oldest ones
    if (backups.length > 5) {
      const backupsToDelete = backups.slice(5); // Keep first 5, delete the rest

      console.log(`[Backup] Deleting ${backupsToDelete.length} old backups`);

      for (const backupName of backupsToDelete) {
        // Delete all files in this backup directory
        const [backupFiles] = await bucket.getFiles({ prefix: `${backupName}/` });

        for (const file of backupFiles) {
          await file.delete();
          console.log(`[Backup] Deleted: ${file.name}`);
        }
      }

      console.log(`[Backup] Cleanup complete - ${backupsToDelete.length} old backups removed`);
    } else {
      console.log('[Backup] No cleanup needed - less than 6 backups exist');
    }
  } catch (error) {
    console.error('[Backup] Cleanup failed:', error);
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

/**
 * List all available backups from Cloud Storage
 */
export async function listBackups(): Promise<BackupListItem[]> {
  try {
    const storage = getStorageClient();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    const [files] = await bucket.getFiles({ prefix: 'backup-' });

    // Extract unique backup directories
    const backupMap = new Map<string, BackupListItem>();

    for (const file of files) {
      const match = file.name.match(/^(backup-[^/]+)\//);
      if (match) {
        const backupName = match[1];
        const timestamp = backupName.replace('backup-', '');

        if (!backupMap.has(backupName)) {
          backupMap.set(backupName, {
            name: backupName,
            timestamp,
          });
        }

        // If this is the metadata file, read it
        if (file.name.endsWith('/_metadata.json')) {
          try {
            const [contents] = await file.download();
            const metadata = JSON.parse(contents.toString()) as BackupMetadata;
            const item = backupMap.get(backupName)!;
            item.metadata = metadata;
          } catch (err) {
            console.error(`[Backup] Failed to read metadata for ${backupName}:`, err);
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    return Array.from(backupMap.values()).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
  } catch (error) {
    console.error('[Backup] Failed to list backups:', error);
    throw error;
  }
}

/**
 * Restore Firestore data from a Cloud Storage backup
 */
export async function restoreBackup(backupName: string): Promise<{
  success: boolean;
  collectionsRestored: number;
  documentsRestored: number;
  error?: string;
}> {
  console.log(`[Restore] Starting restore from: ${backupName}`);

  try {
    const storage = getStorageClient();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    // List all files in the backup directory
    const [files] = await bucket.getFiles({ prefix: `${backupName}/` });

    const jsonFiles = files.filter(f =>
      f.name.endsWith('.json') && !f.name.endsWith('/_metadata.json')
    );

    console.log(`[Restore] Found ${jsonFiles.length} collection files to restore`);

    let collectionsRestored = 0;
    let documentsRestored = 0;

    for (const file of jsonFiles) {
      // Extract collection name from file path
      const fileName = file.name.split('/').pop()!;
      const collectionName = fileName.replace('.json', '');

      console.log(`[Restore] Restoring collection: ${collectionName}`);

      try {
        // Download the backup file
        const [contents] = await file.download();
        const documents = JSON.parse(contents.toString()) as Array<Record<string, unknown> & { id: string }>;

        console.log(`[Restore] - ${documents.length} documents to restore`);

        // Delete existing documents in this collection
        const collectionPath = `${FIRESTORE_PREFIX}/${collectionName}`;
        const existingDocs = await adminDb.collection(collectionPath).get();

        if (!existingDocs.empty) {
          console.log(`[Restore] - Deleting ${existingDocs.size} existing documents`);
          const batch = adminDb.batch();
          existingDocs.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }

        // Restore documents from backup in batches of 500 (Firestore limit)
        const BATCH_SIZE = 500;
        for (let i = 0; i < documents.length; i += BATCH_SIZE) {
          const batch = adminDb.batch();
          const batchDocs = documents.slice(i, i + BATCH_SIZE);

          for (const doc of batchDocs) {
            const { id, ...data } = doc;
            const docRef = adminDb.collection(collectionPath).doc(id);
            batch.set(docRef, data);
          }

          await batch.commit();
          console.log(`[Restore] - Restored batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchDocs.length} documents`);
        }

        documentsRestored += documents.length;
        collectionsRestored++;
        console.log(`[Restore] ✓ Restored ${collectionName}: ${documents.length} documents`);
      } catch (err) {
        console.error(`[Restore] Error restoring collection ${collectionName}:`, err);
        // Continue with other collections
      }
    }

    console.log(`[Restore] Complete: ${collectionsRestored} collections, ${documentsRestored} documents`);

    return {
      success: true,
      collectionsRestored,
      documentsRestored,
    };
  } catch (error) {
    console.error('[Restore] Failed:', error);
    return {
      success: false,
      collectionsRestored: 0,
      documentsRestored: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
