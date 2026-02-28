/**
 * Import ToernooiProf SQL data into Firestore
 *
 * Reads importdata/localhost.sql and imports all tp_* records into
 * Firestore under the ToernooiProf/data/ namespace.
 *
 * Collections written:
 *   ToernooiProf/data/gebruikers     ← tp_gebruikers
 *   ToernooiProf/data/organizations  ← tp_gebruikers (voor inlogcode-login)
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
const fileArg = args.find(a => a.startsWith('--file='))?.split('=').slice(1).join('=');

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
 *
 * Supports two phpMyAdmin export formats:
 *  1. Multi-row: INSERT INTO `t` (cols) VALUES\n(r1),\n(r2),...\n(rN);
 *  2. Single-row: INSERT INTO `t` (cols) VALUES (r1),(r2),...;
 */
function parseInserts(sql, tableName) {
  const records = [];
  const lines = sql.split('\n');

  const headerRe = new RegExp(
    `^INSERT INTO \\\`${tableName}\\\` \\(([^)]+)\\) VALUES`,
    'i'
  );

  let columns = null;
  let inInsert = false;
  let singleLineValues = null; // for single-line INSERT

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inInsert) {
      const m = headerRe.exec(trimmed);
      if (!m) continue;

      columns = m[1].split(',').map(c => c.trim().replace(/`/g, ''));
      inInsert = true;

      // Check if VALUES is followed by data on the SAME line
      const afterValues = trimmed.replace(headerRe, '').trim();
      if (afterValues.startsWith('(')) {
        // Single-line format: parse the rest of this line (and possibly next lines)
        singleLineValues = afterValues;
      }
      // Multi-line format: data starts on next line
      continue;
    }

    // --- Multi-line format: each row on its own line ---
    if (singleLineValues === null) {
      if (!trimmed.startsWith('(')) {
        inInsert = false;
        columns = null;
        continue;
      }

      // Remove trailing comma or semicolon
      const rowStr = trimmed.replace(/[,;]\s*$/, '');
      const inner = rowStr.slice(1, -1); // strip outer ()
      const vals = parseTupleValues(inner);
      if (vals.length === columns.length) {
        const record = {};
        columns.forEach((col, idx) => { record[col] = vals[idx]; });
        records.push(record);
      }

      if (trimmed.endsWith(';') || trimmed.endsWith(');')) {
        inInsert = false;
        columns = null;
      }
      continue;
    }

    // --- Single-line format: accumulate until we hit a line ending with ; ---
    singleLineValues += '\n' + trimmed;
    if (trimmed.endsWith(';')) {
      // Parse all tuples from accumulated content
      const tupleRe = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
      let tm;
      while ((tm = tupleRe.exec(singleLineValues)) !== null) {
        const vals = parseTupleValues(tm[1]);
        if (vals.length !== columns.length) continue;
        const record = {};
        columns.forEach((col, idx) => { record[col] = vals[idx]; });
        records.push(record);
      }
      inInsert = false;
      columns = null;
      singleLineValues = null;
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

/**
 * Import organizations from tp_gebruikers.
 * Organizations zijn nodig voor inlogcode-login; zonder deze collectie
 * vindt de login geen match op org_code.
 */
function importOrganizations(sql, db) {
  const records = parseInserts(sql, 'tp_gebruikers').map(r => ({
    org_nummer: r.gebruiker_nr,
    org_code: r.gebruiker_code || '',
    org_naam: r.gebruiker_naam || '',
    org_wl_naam: r.tp_wl_naam || '',
    org_wl_email: r.tp_wl_email || '',
    org_logo: r.gebruiker_logo || '',
    aantal_tafels: r.aantal_tafels ?? 4,
    date_aangemaakt: toIsoDate(r.date_start) || new Date().toISOString(),
    date_inlog: toIsoDate(r.date_inlog) || '',
    nieuwsbrief: r.nieuwsbrief ?? 0,
    muis_tablet: 1,
    reclame_pagina: 0,
    aantal_reclames: 0,
    slideshow_interval: 10,
    sorteren: 1,
  }));
  return batchWrite(db, 'organizations', records, r => String(r.org_nummer));
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

  const resolvedSqlFile = fileArg
    ? path.resolve(projectRoot, fileArg)
    : sqlFile;
  console.log(`SQL bestand: ${resolvedSqlFile}`);
  const sql = readFileSync(resolvedSqlFile, 'utf-8');
  console.log(`SQL geladen (${(sql.length / 1024 / 1024).toFixed(1)} MB)\n`);

  let firestoreDb;
  if (!dryRun) {
    console.log('Firebase initialiseren...');
    firestoreDb = initFirebase();
    console.log('Verbonden met Firestore\n');
  }

  const tables = [
    { name: 'tp_gebruikers', fn: importGebruikers, label: 'gebruikers' },
    { name: 'tp_gebruikers', fn: importOrganizations, label: 'organizations' },
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
