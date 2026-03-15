/**
 * Migrate legacy uitslagen document IDs to tenant-scoped IDs.
 *
 * Legacy ID format:   "<uitslag_id>"
 * New ID format:      "<orgNummer>_<compNumber>_<uitslagId>"
 *
 * Usage:
 *   node scripts/migrate-uitslagen-ids.mjs --dry-run
 *   node scripts/migrate-uitslagen-ids.mjs --limit=500
 *   node scripts/migrate-uitslagen-ids.mjs --batch-size=200
 *   node scripts/migrate-uitslagen-ids.mjs --start-after=<docId>
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const batchSizeArg = args.find((a) => a.startsWith('--batch-size='))?.split('=')[1];
const startAfterArg = args.find((a) => a.startsWith('--start-after='))?.split('=').slice(1).join('=');

const MAX_BATCH = Math.min(Math.max(Number(batchSizeArg) || 250, 1), 450);
const HARD_LIMIT = Math.max(Number(limitArg) || 0, 0);
const UitslagenCollectionPath = 'ToernooiProf/data/uitslagen';
const LegacyIdMapCollectionPath = 'ToernooiProf/data/legacy_id_map';

function initFirebase() {
  const envContent = readFileSync(envPath, 'utf-8');
  const keyLine = envContent.split('\n').find((l) => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
  if (!keyLine) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY niet gevonden in .env.local');
  const raw = keyLine.slice('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();
  const serviceAccount = JSON.parse(raw.replace(/^['"]|['"]$/g, ''));

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function buildNewDocId(data) {
  const orgNummer = Number(data?.org_nummer ?? data?.gebruiker_nr);
  const compNumber = Number(data?.comp_nr ?? data?.t_nummer);
  const uitslagId = Number(data?.uitslag_id);
  if (!orgNummer || !compNumber || !uitslagId) return null;
  return `${orgNummer}_${compNumber}_${uitslagId}`;
}

function isLegacyDocId(docId) {
  return /^\d+$/.test(docId);
}

async function main() {
  console.log('=== Migrate uitslagen IDs ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`);
  console.log(`Batch size: ${MAX_BATCH}`);
  if (HARD_LIMIT > 0) console.log(`Hard limit: ${HARD_LIMIT}`);
  if (startAfterArg) console.log(`Start after docId: ${startAfterArg}`);
  console.log(`Collection: ${UitslagenCollectionPath}`);

  const db = initFirebase();
  let query = db.collection(UitslagenCollectionPath).orderBy('__name__').limit(1000);
  if (startAfterArg) {
    const startAfterRef = db.collection(UitslagenCollectionPath).doc(startAfterArg);
    const startAfterDoc = await startAfterRef.get();
    if (startAfterDoc.exists) {
      query = query.startAfter(startAfterDoc);
    }
  }

  let processed = 0;
  let migrated = 0;
  let skipped = 0;
  let invalid = 0;
  let cursor = null;

  while (true) {
    const pageQuery = cursor
      ? db.collection(UitslagenCollectionPath).orderBy('__name__').startAfter(cursor).limit(1000)
      : query;
    const snap = await pageQuery.get();
    if (snap.empty) break;

    let batch = db.batch();
    let opsInBatch = 0;

    for (const doc of snap.docs) {
      if (HARD_LIMIT > 0 && processed >= HARD_LIMIT) break;
      processed++;

      const legacyId = doc.id;
      const data = doc.data() || {};
      const newId = buildNewDocId(data);

      if (!newId) {
        invalid++;
        continue;
      }
      if (!isLegacyDocId(legacyId)) {
        skipped++;
        continue;
      }
      if (legacyId === newId) {
        skipped++;
        continue;
      }

      const newRef = db.collection(UitslagenCollectionPath).doc(newId);
      const existingTarget = await newRef.get();
      if (existingTarget.exists) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        batch.set(newRef, {
          ...data,
          legacy_doc_id: legacyId,
          migrated_at: new Date().toISOString(),
        });
        batch.set(db.collection(LegacyIdMapCollectionPath).doc(`uitslagen_${legacyId}`), {
          collection: 'uitslagen',
          legacy_doc_id: legacyId,
          new_doc_id: newId,
          org_nummer: Number(data?.org_nummer ?? data?.gebruiker_nr) || null,
          comp_nr: Number(data?.comp_nr ?? data?.t_nummer) || null,
          uitslag_id: Number(data?.uitslag_id) || null,
          migrated_at: new Date().toISOString(),
        });
        batch.delete(doc.ref);
        opsInBatch += 3;
      }

      migrated++;
      if (!dryRun && opsInBatch >= MAX_BATCH) {
        await batch.commit();
        batch = db.batch();
        opsInBatch = 0;
      }
    }

    if (!dryRun && opsInBatch > 0) {
      await batch.commit();
    }

    cursor = snap.docs[snap.docs.length - 1];
    console.log(
      `[progress] processed=${processed} migrated=${migrated} skipped=${skipped} invalid=${invalid} last=${cursor.id}`
    );

    if (HARD_LIMIT > 0 && processed >= HARD_LIMIT) break;
  }

  console.log('--- klaar ---');
  console.log(`processed=${processed}`);
  console.log(`migrated=${migrated}`);
  console.log(`skipped=${skipped}`);
  console.log(`invalid=${invalid}`);
}

main().catch((err) => {
  console.error('Fatale fout:', err);
  process.exit(1);
});

