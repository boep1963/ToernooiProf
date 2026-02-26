/**
 * ClubMatch Firestore Backup – Scheduled Cloud Function (JavaScript)
 *
 * Gebruik: plak deze code in je Cloud Functions-codebase (.js).
 * Draait elke nacht om 05:00 (Europe/Amsterdam).
 *
 * In je index.js: exporteer de function, bijv.:
 *   const { clubmatchNightlyBackup } = require('./clubmatchNightlyBackup');
 *   exports.clubmatchNightlyBackup = clubmatchNightlyBackup;
 * Of in één regel: exports.clubmatchNightlyBackup = require('./clubmatchNightlyBackup').clubmatchNightlyBackup;
 *
 * Vereisten: firebase-admin, firebase-functions (v2)
 *
 * Configuratie (omgevingsvariabelen):
 * - BACKUP_BUCKET_NAME (default: backupclubmatch)
 * - FIRESTORE_PREFIX (default: ClubMatch/data)
 *
 * De service account van de Cloud Function moet schrijfrechten hebben op de backup-bucket.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

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

function getBucketName() {
  return process.env.BACKUP_BUCKET_NAME || 'backupclubmatch';
}

function getFirestorePrefix() {
  return process.env.FIRESTORE_PREFIX || 'ClubMatch/data';
}

async function exportCollection(db, collectionName, prefix) {
  const collectionId = `${prefix}/${collectionName}`;
  const snapshot = await db.collection(collectionId).get();
  const documents = [];
  snapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  return documents;
}

async function cleanupOldBackups(bucket, maxBackups = 5) {
  const [files] = await bucket.getFiles({ prefix: 'backup-' });
  const backupDirs = new Set();
  for (const file of files) {
    const match = file.name.match(/^(backup-[^/]+)\//);
    if (match) backupDirs.add(match[1]);
  }
  const backups = Array.from(backupDirs).sort().reverse();
  if (backups.length <= maxBackups) return;
  const toDelete = backups.slice(maxBackups);
  for (const backupName of toDelete) {
    const [backupFiles] = await bucket.getFiles({ prefix: `${backupName}/` });
    for (const file of backupFiles) await file.delete();
  }
}

const clubmatchNightlyBackup = onSchedule(
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
    const backupedCollections = [];

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

    const metadata = {
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

exports.clubmatchNightlyBackup = clubmatchNightlyBackup;
