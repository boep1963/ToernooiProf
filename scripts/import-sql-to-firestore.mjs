#!/usr/bin/env node

/**
 * Import SQL data from the legacy PHP/MariaDB ClubMatch database into Firestore.
 *
 * This script reads a mysqldump SQL file and imports data into the Firestore
 * collections used by the Next.js ClubMatch application.
 *
 * SQL Table -> Firestore Collection mapping:
 *   bj_bediening      -> device_config
 *   bj_competities     -> competitions
 *   bj_organisaties    -> organizations
 *   bj_partijen        -> matches
 *   bj_spelers_algemeen -> members
 *   bj_spelers_comp    -> competition_players
 *   bj_tafel           -> tables
 *   bj_uitslagen       -> results
 *
 * Usage:
 *   node scripts/import-sql-to-firestore.mjs [path-to-sql-file]
 *
 * If no path is given, it looks for .sql files in importdata/ subdirectories.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ─── Load environment variables from .env.local ─────────────────────────────
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found. Cannot initialize Firebase.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let value = trimmed.substring(eqIdx + 1).trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

// ─── Firebase Admin SDK initialization ──────────────────────────────────────
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebase() {
  if (getApps().length > 0) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not set in .env.local');
    process.exit(1);
  }
  const creds = JSON.parse(raw);
  return initializeApp({ credential: cert(creds) });
}

const app = initFirebase();
const firestore = getFirestore(app);

/** All Firestore collections live under ClubMatch/data/<collection> */
const PREFIX = 'ClubMatch/data';

function col(name) {
  return firestore.collection(`${PREFIX}/${name}`);
}

// ─── SQL Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a mysqldump SQL file and extract INSERT rows for each table.
 * Returns a Map<tableName, Array<Record<string, any>>>
 */
function parseSqlFile(filePath) {
  console.log(`Reading SQL file: ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  /** @type {Map<string, Array<Record<string, any>>>} */
  const tables = new Map();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Detect INSERT INTO lines
    const insertMatch = line.match(/^INSERT INTO `(\w+)` \(([^)]+)\) VALUES$/i);
    if (!insertMatch) {
      // Also handle INSERT INTO ... VALUES on the same line continuing with data
      const inlineMatch = line.match(/^INSERT INTO `(\w+)` \(([^)]+)\) VALUES\s*$/i);
      if (!inlineMatch) {
        i++;
        continue;
      }
    }

    const tableName = (insertMatch || line.match(/^INSERT INTO `(\w+)` \(([^)]+)\) VALUES/i))[1];
    const columnsRaw = (insertMatch || line.match(/^INSERT INTO `(\w+)` \(([^)]+)\) VALUES/i))[2];
    const columns = columnsRaw.split(',').map(c => c.trim().replace(/`/g, ''));

    if (!tables.has(tableName)) {
      tables.set(tableName, []);
    }
    const rows = tables.get(tableName);

    // Now gather all value rows until we hit a line ending with ;
    i++;
    let valueBlock = '';
    while (i < lines.length) {
      const vLine = lines[i].trim();
      if (!vLine || vLine.startsWith('--')) {
        i++;
        continue;
      }
      valueBlock += vLine;
      if (vLine.endsWith(';')) {
        break;
      }
      i++;
    }
    i++;

    // Remove trailing ;
    valueBlock = valueBlock.replace(/;\s*$/, '');

    // Parse value tuples: (v1, v2, ...), (v1, v2, ...), ...
    const tuples = extractTuples(valueBlock);

    for (const tuple of tuples) {
      const values = parseTupleValues(tuple);
      if (values.length !== columns.length) {
        // Skip malformed rows
        continue;
      }
      const row = {};
      for (let c = 0; c < columns.length; c++) {
        row[columns[c]] = values[c];
      }
      rows.push(row);
    }
  }

  return tables;
}

/**
 * Extract individual tuples from a VALUES block.
 * Handles nested parentheses and quoted strings containing commas/parentheses.
 */
function extractTuples(block) {
  const tuples = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let current = '';

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      current += ch;
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !escapeNext) {
      inString = !inString;
      current += ch;
      continue;
    }

    if (inString) {
      current += ch;
      continue;
    }

    if (ch === '(') {
      if (depth === 0) {
        current = '';
      } else {
        current += ch;
      }
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        tuples.push(current);
        current = '';
      } else {
        current += ch;
      }
    } else {
      if (depth > 0) {
        current += ch;
      }
    }
  }

  return tuples;
}

/**
 * Parse comma-separated values inside a tuple, respecting quoted strings.
 * Returns array of parsed values (number, string, null, or Date).
 */
function parseTupleValues(tuple) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < tuple.length; i++) {
    const ch = tuple[i];

    if (escapeNext) {
      // Handle MySQL escapes
      if (ch === "'") {
        current += "'";
      } else if (ch === "n") {
        current += "\n";
      } else if (ch === "r") {
        current += "\r";
      } else if (ch === "t") {
        current += "\t";
      } else if (ch === "\\") {
        current += "\\";
      } else if (ch === "0") {
        current += "\0";
      } else {
        current += ch;
      }
      escapeNext = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !inString) {
      inString = true;
      continue;
    }

    if (ch === "'" && inString) {
      // Check for double-quote escape ''
      if (i + 1 < tuple.length && tuple[i + 1] === "'") {
        current += "'";
        i++;
        continue;
      }
      inString = false;
      continue;
    }

    if (ch === ',' && !inString) {
      values.push(parseValue(current.trim()));
      current = '';
      continue;
    }

    current += ch;
  }

  // Last value
  values.push(parseValue(current.trim()));

  return values;
}

/**
 * Parse a single SQL value string to a JS value.
 */
function parseValue(str) {
  if (str === 'NULL' || str === '') return null;

  // Check if it looks like a number
  if (/^-?\d+$/.test(str)) {
    return parseInt(str, 10);
  }
  if (/^-?\d+\.\d+$/.test(str)) {
    return parseFloat(str);
  }

  // It's a string (already unquoted by our parser)
  // Decode HTML entities that MySQL may have stored
  return decodeHtmlEntities(str);
}

/**
 * Decode common HTML entities.
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

// ─── Firestore Importers ────────────────────────────────────────────────────

/**
 * Write documents in batches of up to 450 (Firestore limit is 500).
 */
async function batchWrite(collectionName, docs) {
  const BATCH_SIZE = 450;
  let written = 0;

  for (let start = 0; start < docs.length; start += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = docs.slice(start, start + BATCH_SIZE);

    for (const { docId, data } of chunk) {
      const ref = col(collectionName).doc(docId);
      batch.set(ref, data);
    }

    await batch.commit();
    written += chunk.length;
    process.stdout.write(`\r  ${collectionName}: ${written}/${docs.length} documents written`);
  }

  console.log(`\r  ${collectionName}: ${written}/${docs.length} documents written ✓`);
}

/**
 * bj_organisaties -> organizations
 */
function mapOrganizations(rows) {
  return rows.map(row => ({
    docId: `org_${row.org_nummer}`,
    data: {
      org_nummer: row.org_nummer,
      org_code: row.org_code || '',
      org_naam: row.org_naam || '',
      org_wl_naam: row.org_wl_naam || '',
      org_wl_email: row.org_wl_email || '',
      org_logo: row.org_logo || '',
      aantal_tafels: row.aantal_tafels || 0,
      return_code: row.return_code || 0,
      time_start: row.time_start || 0,
      code_ontvangen: row.code_ontvangen || 0,
      date_start: row.date_start || '2025-01-01',
      date_inlog: row.date_inlog || '2025-01-01',
      nieuwsbrief: row.nieuwsbrief ?? 1,
      reminder_send: row.reminder_send || 0,
    }
  }));
}

/**
 * bj_spelers_algemeen -> members
 */
function mapMembers(rows) {
  return rows.map(row => ({
    docId: `member_${row.spa_org}_${row.spa_nummer}`,
    data: {
      spa_nummer: row.spa_nummer,
      spa_vnaam: row.spa_vnaam || '',
      spa_tv: row.spa_tv || '',
      spa_anaam: row.spa_anaam || '',
      spa_org: row.spa_org,
      spa_moy_lib: row.spa_moy_lib || 0,
      spa_moy_band: row.spa_moy_band || 0,
      spa_moy_3bkl: row.spa_moy_3bkl || 0,
      spa_moy_3bgr: row.spa_moy_3bgr || 0,
      spa_moy_kad: row.spa_moy_kad || 0,
    }
  }));
}

/**
 * bj_competities -> competitions
 */
function mapCompetitions(rows) {
  return rows.map(row => ({
    docId: `comp_${row.org_nummer}_${row.comp_nr}`,
    data: {
      org_nummer: row.org_nummer,
      comp_nr: row.comp_nr,
      comp_naam: row.comp_naam || '',
      comp_datum: row.comp_datum || '',
      discipline: row.discipline || 1,
      periode: row.periode || 1,
      punten_sys: row.punten_sys || 1,
      moy_form: row.moy_form || 1,
      min_car: row.min_car || 0,
      max_beurten: row.max_beurten || 0,
      vast_beurten: row.vast_beurten || 0,
      sorteren: row.sorteren || 1,
    }
  }));
}

/**
 * bj_spelers_comp -> competition_players
 */
function mapCompetitionPlayers(rows) {
  return rows.map(row => ({
    docId: `cp_${row.spc_org}_${row.spc_competitie}_${row.spc_nummer}`,
    data: {
      spc_nummer: row.spc_nummer,
      spc_org: row.spc_org,
      spc_competitie: row.spc_competitie,
      spc_moyenne_1: row.spc_moyenne_1 || 0,
      spc_car_1: row.spc_car_1 || 0,
      spc_moyenne_2: row.spc_moyenne_2 || 0,
      spc_car_2: row.spc_car_2 || 0,
      spc_moyenne_3: row.spc_moyenne_3 || 0,
      spc_car_3: row.spc_car_3 || 0,
      spc_moyenne_4: row.spc_moyenne_4 || 0,
      spc_car_4: row.spc_car_4 || 0,
      spc_moyenne_5: row.spc_moyenne_5 || 0,
      spc_car_5: row.spc_car_5 || 0,
    }
  }));
}

/**
 * bj_partijen -> matches
 */
function mapMatches(rows) {
  return rows.map(row => ({
    docId: `match_${row.org_nummer}_${row.comp_nr}_${row.uitslag_code}`,
    data: {
      org_nummer: row.org_nummer,
      comp_nr: row.comp_nr,
      nummer_A: row.nummer_A,
      naam_A: row.naam_A || '',
      cartem_A: row.cartem_A || 0,
      tafel: row.tafel || '',
      nummer_B: row.nummer_B,
      naam_B: row.naam_B || '',
      cartem_B: row.cartem_B || 0,
      periode: row.periode || 1,
      uitslag_code: row.uitslag_code || '',
      gespeeld: row.gespeeld || 0,
    }
  }));
}

/**
 * bj_uitslagen -> results
 */
function mapResults(rows) {
  return rows.map(row => ({
    docId: `result_${row.org_nummer}_${row.comp_nr}_${row.uitslag_code}`,
    data: {
      org_nummer: row.org_nummer,
      comp_nr: row.comp_nr,
      uitslag_code: row.uitslag_code || '',
      periode: row.periode || 1,
      speeldatum: row.speeldatum || '2025-01-06',
      sp_1_nr: row.sp_1_nr,
      sp_1_cartem: row.sp_1_cartem || 0,
      sp_1_cargem: row.sp_1_cargem || 0,
      sp_1_hs: row.sp_1_hs || 0,
      sp_1_punt: row.sp_1_punt || 0,
      brt: row.brt || 0,
      sp_2_nr: row.sp_2_nr,
      sp_2_cartem: row.sp_2_cartem || 0,
      sp_2_cargem: row.sp_2_cargem || 0,
      sp_2_hs: row.sp_2_hs || 0,
      sp_2_punt: row.sp_2_punt || 0,
      gespeeld: row.gespeeld || 0,
    }
  }));
}

/**
 * bj_tafel -> tables
 */
function mapTables(rows) {
  return rows.map(row => ({
    docId: `table_${row.org_nummer}_${row.comp_nr}_${row.tafel_nr}_${row.u_code}`,
    data: {
      org_nummer: row.org_nummer,
      comp_nr: row.comp_nr,
      u_code: row.u_code || '',
      tafel_nr: row.tafel_nr,
      status: row.status || 0,
    }
  }));
}

/**
 * bj_bediening -> device_config
 */
function mapDeviceConfig(rows) {
  return rows.map(row => ({
    docId: `device_${row.org_nummer}_${row.tafel_nr}`,
    data: {
      org_nummer: row.org_nummer,
      tafel_nr: row.tafel_nr,
      soort: row.soort || 1,
    }
  }));
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Determine SQL file path
  let sqlPath = process.argv[2];

  if (!sqlPath) {
    // Auto-discover SQL file in importdata/
    const importDir = path.join(projectRoot, 'importdata');
    if (fs.existsSync(importDir)) {
      const found = findSqlFiles(importDir);
      if (found.length === 0) {
        console.error('ERROR: No .sql files found in importdata/ directory.');
        console.error('Usage: node scripts/import-sql-to-firestore.mjs [path-to-sql-file]');
        process.exit(1);
      }
      if (found.length > 1) {
        console.log('Multiple SQL files found:');
        found.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
        console.log(`Using first: ${found[0]}`);
      }
      sqlPath = found[0];
    } else {
      console.error('ERROR: importdata/ directory not found.');
      process.exit(1);
    }
  }

  if (!fs.existsSync(sqlPath)) {
    console.error(`ERROR: SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  ClubMatch SQL → Firestore Import Tool               ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  // Step 1: Parse SQL
  console.log('Step 1: Parsing SQL file...');
  const tables = parseSqlFile(sqlPath);

  console.log(`\nTables found in SQL dump:`);
  for (const [name, rows] of tables) {
    console.log(`  ${name}: ${rows.length} rows`);
  }
  console.log('');

  // Step 2: Map and import each table
  console.log('Step 2: Importing data into Firestore...\n');

  const mappings = [
    { sqlTable: 'bj_organisaties', collection: 'organizations', mapper: mapOrganizations },
    { sqlTable: 'bj_spelers_algemeen', collection: 'members', mapper: mapMembers },
    { sqlTable: 'bj_competities', collection: 'competitions', mapper: mapCompetitions },
    { sqlTable: 'bj_spelers_comp', collection: 'competition_players', mapper: mapCompetitionPlayers },
    { sqlTable: 'bj_partijen', collection: 'matches', mapper: mapMatches },
    { sqlTable: 'bj_uitslagen', collection: 'results', mapper: mapResults },
    { sqlTable: 'bj_tafel', collection: 'tables', mapper: mapTables },
    { sqlTable: 'bj_bediening', collection: 'device_config', mapper: mapDeviceConfig },
  ];

  const stats = {};

  for (const { sqlTable, collection, mapper } of mappings) {
    const rows = tables.get(sqlTable);
    if (!rows || rows.length === 0) {
      console.log(`  ${collection}: No data found in ${sqlTable} (skipped)`);
      stats[collection] = 0;
      continue;
    }

    const docs = mapper(rows);

    // Deduplicate by docId (keep last occurrence)
    const docMap = new Map();
    for (const doc of docs) {
      docMap.set(doc.docId, doc);
    }
    const uniqueDocs = Array.from(docMap.values());

    await batchWrite(collection, uniqueDocs);
    stats[collection] = uniqueDocs.length;
  }

  // Step 3: Summary
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  Import Complete!                                     ║');
  console.log('╠═══════════════════════════════════════════════════════╣');

  let total = 0;
  for (const [collection, count] of Object.entries(stats)) {
    console.log(`║  ${collection.padEnd(25)} ${String(count).padStart(6)} docs  ║`);
    total += count;
  }
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║  TOTAL                    ${String(total).padStart(6)} docs  ║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
}

/**
 * Recursively find .sql files in a directory.
 */
function findSqlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSqlFiles(fullPath));
    } else if (entry.name.endsWith('.sql')) {
      results.push(fullPath);
    }
  }
  return results;
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
