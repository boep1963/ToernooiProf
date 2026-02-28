/**
 * Import ToernooiProf SQL data into Firestore
 *
 * Reads importdata/localhost.sql and imports all tp_* records into
 * Firestore under the ToernooiProf/data/ namespace.
 *
 * Collections written:
 *   ToernooiProf/data/gebruikers     ← tp_gebruikers
 *   ToernooiProf/data/toernooien     ← tp_data
 *   ToernooiProf/data/spelers        ← tp_spelers
 *   ToernooiProf/data/poules         ← tp_poules
 *   ToernooiProf/data/uitslagen      ← tp_uitslagen
 *
 * Usage:
 *   node scripts/import-tp-sql-to-firestore.mjs [--dry-run] [--table=tp_data]
 *
 * Options:
 *   --dry-run     Parse and count records but do not write to Firestore
 *   --table=NAME  Only import the specified table (e.g. --table=tp_spelers)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const sqlFile = path.join(projectRoot, 'importdata', 'localhost.sql');
const envPath = path.join(projectRoot, '.env.local');

// ─── CLI args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tableArg = args.find(a => a.startsWith('--table='))?.split('=')[1];

// ─── Firebase init ─────────────────────────────────────────────────────────
function initFirebase() {
  const envContent = readFileSync(envPath, 'utf-8');
  const keyLine = envContent.split('\n').find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
  if (!keyLine) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY niet gevonden in .env.local');
  const raw = keyLine.slice('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();
  const serviceAccount = JSON.parse(raw.replace(/^['"]|['"]$/g, ''));

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

// ─── SQL parser ────────────────────────────────────────────────────────────
/**
 * Extract INSERT rows for a specific table from SQL content.
 * Returns array of column-value objects.
 */
function parseInserts(sql, tableName) {
  const records = [];
  // Match INSERT INTO `tableName` (`col1`,`col2`,...) VALUES (v1,v2,...), ...;
  const insertRegex = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\s*([\\s\\S]+?);`,
    'gi'
  );

  let match;
  while ((match = insertRegex.exec(sql)) !== null) {
    const colPart = match[1];
    const valuesPart = match[2];

    const columns = colPart
      .split(',')
      .map(c => c.trim().replace(/`/g, ''));

    // Split individual value tuples – handles multiline and escaped quotes
    const tupleRegex = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    let tupleMatch;
    while ((tupleMatch = tupleRegex.exec(valuesPart)) !== null) {
      const vals = parseTupleValues(tupleMatch[1]);
      if (vals.length !== columns.length) continue;

      const record = {};
      columns.forEach((col, i) => {
        record[col] = vals[i];
      });
      records.push(record);
    }
  }
  return records;
}

/**
 * Parse a comma-separated SQL value list into JS values.
 * Handles: NULL, integers, decimals, single-quoted strings.
 */
function parseTupleValues(raw) {
  const values = [];
  let current = '';
  let inString = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "'" && !inString) {
      inString = true;
      i++;
      continue;
    }
    if (ch === "'" && inString) {
      if (raw[i + 1] === "'") {
        current += "'";
        i += 2;
        continue;
      }
      inString = false;
      i++;
      continue;
    }
    if (ch === ',' && !inString) {
      values.push(convertValue(current.trim()));
      current = '';
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  values.push(convertValue(current.trim()));
  return values;
}

function convertValue(raw) {
  if (raw === 'NULL') return null;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);
  return raw;
}

// ─── Date normalisation ────────────────────────────────────────────────────
function toIsoDate(val) {
  if (!val || val === '0000-00-00') return '';
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
    return val.substring(0, 10);
  }
  return String(val);
}

// ─── Firestore batch writer ────────────────────────────────────────────────
const BATCH_SIZE = 499;

async function batchWrite(db, collectionPath, records, idFn) {
  if (!db) {
    // dry-run: just count
    return records.length;
  }
  let written = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const record of records) {
    const docId = idFn(record);
    const ref = db.doc(`ToernooiProf/data/${collectionPath}/${docId}`);
    batch.set(ref, record);
    batchCount++;
    written++;

    if (batchCount >= BATCH_SIZE) {
      if (!dryRun) await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0 && !dryRun) {
    await batch.commit();
  }

  return written;
}

// ─── Table importers ───────────────────────────────────────────────────────

function importGebruikers(sql, db) {
  const records = parseInserts(sql, 'tp_gebruikers');
  return batchWrite(db, 'gebruikers', records, r => String(r.gebruiker_nr));
}

function importToernooien(sql, db) {
  const records = parseInserts(sql, 'tp_data').map(r => ({
    ...r,
    // Ensure routing aliases
    org_nummer: r.gebruiker_nr,
    comp_nr: r.t_nummer,
    comp_naam: r.t_naam,
    comp_datum: r.t_datum ?? '',
    punten_sys: r.t_punten_sys,
    moy_form: r.t_moy_form,
    min_car: r.t_min_car,
    max_beurten: r.t_max_beurten,
    periode: r.t_ronde,
    // Normalise dates
    datum_start: toIsoDate(r.datum_start),
    datum_eind: toIsoDate(r.datum_eind),
  }));
  return batchWrite(db, 'toernooien', records,
    r => `${r.gebruiker_nr}_${r.t_nummer}`);
}

function importSpelers(sql, db) {
  const records = parseInserts(sql, 'tp_spelers').map(r => ({
    ...r,
    sp_startmoy: parseFloat(String(r.sp_startmoy)) || 0,
    sp_startcar: parseInt(String(r.sp_startcar)) || 0,
  }));
  return batchWrite(db, 'spelers', records,
    r => `${r.gebruiker_nr}_${r.t_nummer}_${r.sp_nummer}`);
}

function importPoules(sql, db) {
  const records = parseInserts(sql, 'tp_poules').map(r => ({
    ...r,
    sp_moy: parseFloat(String(r.sp_moy)) || 0,
  }));
  return batchWrite(db, 'poules', records, r => String(r.poule_id));
}

function importUitslagen(sql, db) {
  const records = parseInserts(sql, 'tp_uitslagen');
  return batchWrite(db, 'uitslagen', records, r => String(r.uitslag_id));
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== ToernooiProf SQL → Firestore import ===');
  if (dryRun) console.log('DRY RUN – geen schrijfacties naar Firestore');

  console.log(`SQL bestand: ${sqlFile}`);
  const sql = readFileSync(sqlFile, 'utf-8');
  console.log(`SQL geladen (${(sql.length / 1024 / 1024).toFixed(1)} MB)\n`);

  let firestoreDb;
  if (!dryRun) {
    console.log('Firebase initialiseren...');
    firestoreDb = initFirebase();
    console.log('Verbonden met Firestore\n');
  }

  const tables = [
    { name: 'tp_gebruikers', fn: importGebruikers, label: 'gebruikers' },
    { name: 'tp_data',       fn: importToernooien, label: 'toernooien' },
    { name: 'tp_spelers',    fn: importSpelers,    label: 'spelers' },
    { name: 'tp_poules',     fn: importPoules,     label: 'poules' },
    { name: 'tp_uitslagen',  fn: importUitslagen,  label: 'uitslagen' },
  ];

  const toRun = tableArg
    ? tables.filter(t => t.name === tableArg || t.label === tableArg)
    : tables;

  if (toRun.length === 0) {
    console.error(`Geen tabel gevonden voor: ${tableArg}`);
    process.exit(1);
  }

  let totalWritten = 0;
  for (const { fn, label } of toRun) {
    process.stdout.write(`Importeren ${label}... `);
    try {
      const count = await fn(sql, firestoreDb);
      console.log(`${count} records ${dryRun ? '(dry-run)' : 'geschreven'}`);
      totalWritten += count;
    } catch (err) {
      console.error(`FOUT bij ${label}:`, err.message);
    }
  }

  console.log(`\nKlaar. Totaal: ${totalWritten} records ${dryRun ? 'gevonden' : 'naar Firestore geschreven'}.`);
}

main().catch(err => {
  console.error('Fatale fout:', err);
  process.exit(1);
});
