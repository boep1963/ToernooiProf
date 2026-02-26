/**
 * ClubMatch Firestore Backup – Scheduled Cloud Function
 *
 * Gebruik: plak deze code in je Cloud Functions-codebase (Firebase Functions v2).
 * Draait elke nacht om 05:00 (Europe/Amsterdam).
 *
 * In je index.ts (of main entry): exporteer de function, bijv.:
 *   export { clubmatchNightlyBackup } from './clubmatchNightlyBackup';
 *
 * Vereisten in die codebase:
 * - firebase-admin (incl. firebase-admin/storage)
 * - firebase-functions (v2)
 *
 * Configuratie via omgevingsvariabelen (Cloud Functions config / .env):
 * - BACKUP_BUCKET_NAME: GCS-bucket voor backups (default: backupclubmatch)
 * - FIRESTORE_PREFIX: Firestore-pad voor collecties (default: ClubMatch/data)
 *
 * Let op: de service account van de Cloud Function moet schrijfrechten hebben op
 * de backup-bucket (Storage Object Admin of vergelijkbaar).
 *
 * Firestore: collecties onder {FIRESTORE_PREFIX}/{naam}, bijv.
 * ClubMatch/data/organizations, ClubMatch/data/results.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const COLLECTIONS_TO_BACKUP = [
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

interface BackupMetadata {
  timestamp: string;
  collections: string[];
  totalDocuments: number;
  durationMs: number;
}

function getBucketName(): string {
  return process.env.BACKUP_BUCKET_NAME || 'backupclubmatch';
}

function getFirestorePrefix(): string {
  return process.env.FIRESTORE_PREFIX || 'ClubMatch/data';
}

async function exportCollection(
  db: ReturnType<typeof getFirestore>,
  collectionName: string,
  prefix: string
): Promise<Record<string, unknown>[]> {
  const collectionId = `${prefix}/${collectionName}`;
  const snapshot = await db.collection(collectionId).get();
  const documents: Record<string, unknown>[] = [];
  snapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  return documents;
}

async function cleanupOldBackups(
  bucket: { getFiles: (opts?: { prefix?: string }) => Promise<[unknown[], unknown?, unknown?]>; file: (name: string) => { delete: () => Promise<unknown> } },
  maxBackups: number = 5
): Promise<void> {
  const [files] = await bucket.getFiles({ prefix: 'backup-' });
  const backupDirs = new Set<string>();
  for (const file of files as Array<{ name: string }>) {
    const match = file.name.match(/^(backup-[^/]+)\//);
    if (match) backupDirs.add(match[1]);
  }
  const backups = Array.from(backupDirs).sort().reverse();
  if (backups.length <= maxBackups) return;
  const toDelete = backups.slice(maxBackups);
  for (const backupName of toDelete) {
    const [backupFiles] = await bucket.getFiles({ prefix: `${backupName}/` });
    for (const file of backupFiles as Array<{ delete: () => Promise<unknown> }>) await file.delete();
  }
}

export const clubmatchNightlyBackup = onSchedule(
  {
    schedule: '0 5 * * *',
    timeZone: 'Europe/Amsterdam',
    region: 'europe-west1',
  },
  async () => {
    const bucketName = getBucketName();
    const prefix = getFirestorePrefix();
    const db = getFirestore();
    const bucket = getStorage().bucket(bucketName);

    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const backupName = `backup-${timestamp}`;

    console.log(`[Backup] Starting: ${backupName}, bucket: ${bucketName}`);

    let totalDocuments = 0;
    const backupedCollections: string[] = [];

    for (const collectionName of COLLECTIONS_TO_BACKUP) {
      try {
        const documents = await exportCollection(db, collectionName, prefix);
        if (documents.length > 0) {
          const file = bucket.file(`${backupName}/${collectionName}.json`);
          await file.save(JSON.stringify(documents, null, 2), {
            contentType: 'application/json',
            metadata: { cacheControl: 'no-cache' },
          });
          totalDocuments += documents.length;
          backupedCollections.push(collectionName);
          console.log(`[Backup] Exported ${collectionName}: ${documents.length} documents`);
        } else {
          console.log(`[Backup] Skipped ${collectionName}: 0 documents`);
        }
      } catch (err) {
        console.error(`[Backup] Error exporting ${collectionName}:`, err);
      }
    }

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

    await cleanupOldBackups(bucket, 5);
    console.log(`[Backup] Done in ${(Date.now() - startTime) / 1000}s: ${totalDocuments} docs, ${backupedCollections.length} collections`);
  }
);
