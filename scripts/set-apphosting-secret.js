#!/usr/bin/env node
/**
 * Prepare FIREBASE_SERVICE_ACCOUNT_KEY from .env.local and show how to set the secret.
 * Pasting JSON in the terminal causes "parse error near }" because the shell interprets { }.
 *
 * This script writes the key to service-account.json so you can use:
 *   firebase apphosting:secrets:set FIREBASE_SERVICE_ACCOUNT_KEY < service-account.json
 * (If the CLI does not accept stdin, create the secret in Google Cloud Console → Secret Manager.)
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');
const outPath = path.join(projectRoot, 'service-account.json');

if (!fs.existsSync(envPath)) {
  console.error('.env.local not found. Create it or pass the path to a file containing only the JSON:');
  console.error('  node scripts/set-apphosting-secret.js /path/to/key.json');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const line = envContent.split('\n').find((l) => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
const value = line ? line.replace(/^FIREBASE_SERVICE_ACCOUNT_KEY=/, '').trim().replace(/^["']|["']$/g, '') : '';

if (!value || value === '""' || value === "''") {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
  process.exit(1);
}

fs.writeFileSync(outPath, value, 'utf8');
console.log('Wrote service-account.json (add to .gitignore if not already).');
console.log('');
console.log('Set the secret using one of these methods:');
console.log('');
console.log('1) Pipe from file (avoids shell parsing):');
console.log('   firebase apphosting:secrets:set FIREBASE_SERVICE_ACCOUNT_KEY < service-account.json');
console.log('');
console.log('2) If that fails, create the secret in Google Cloud Console:');
console.log('   https://console.cloud.google.com/security/secret-manager');
console.log('   Create secret → name: FIREBASE_SERVICE_ACCOUNT_KEY → paste the contents of service-account.json');
console.log('   Then: firebase apphosting:secrets:grantaccess FIREBASE_SERVICE_ACCOUNT_KEY --backend clubmatch');
console.log('');
console.log('After setting, you can delete service-account.json for security.');
