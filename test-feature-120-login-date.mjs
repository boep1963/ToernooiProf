#!/usr/bin/env node

/**
 * Feature #120: Login date tracking updated on login
 *
 * Verification steps:
 * 1. Get current login date from local database for test org
 * 2. Login via API
 * 3. Verify date_inlog field was updated to current timestamp
 */

import { readFileSync } from 'fs';

const DB_FILE = './.data/organizations.json';

async function testLoginDateTracking() {
  console.log('\n=== Feature #120: Login Date Tracking Test ===\n');

  const testCode = '1205_AAY@#';

  // Step 1: Get current login date
  console.log('Step 1: Getting current login date from database...');
  const beforeData = JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  const orgEntry = Object.entries(beforeData).find(([_, org]) => org.org_code === testCode);

  if (!orgEntry) {
    console.error('❌ Test organization not found!');
    process.exit(1);
  }

  const [orgId, orgData] = orgEntry;
  const oldLoginDate = orgData.date_inlog;

  console.log(`   Organization: ${orgData.org_naam} (${orgData.org_nummer})`);
  console.log(`   Current date_inlog: ${oldLoginDate}`);

  // Wait a moment to ensure timestamp difference
  console.log('\n   Waiting 2 seconds to ensure timestamp difference...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Login via API
  console.log('\nStep 2: Logging in via API...');
  const beforeLogin = new Date().toISOString();

  const response = await fetch('http://localhost:3000/api/auth/login-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: testCode }),
  });

  if (!response.ok) {
    console.error('❌ Login failed!');
    const error = await response.json();
    console.error('   Error:', error);
    process.exit(1);
  }

  const loginResult = await response.json();
  console.log('   ✅ Login successful');
  console.log(`   Organization: ${loginResult.organization.org_naam}`);

  // Step 3: Verify date_inlog was updated
  console.log('\nStep 3: Verifying date_inlog was updated in database...');

  // Small delay to ensure file write completed
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get fresh data from database
  const afterData = JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  const updatedOrg = afterData[orgId];
  const newLoginDate = updatedOrg.date_inlog;

  console.log(`   Old date_inlog: ${oldLoginDate}`);
  console.log(`   New date_inlog: ${newLoginDate}`);
  console.log(`   Before login:   ${beforeLogin}`);

  // Step 4: Verify the timestamp was updated
  console.log('\nStep 4: Validating timestamp update...');

  if (oldLoginDate === newLoginDate) {
    console.error('   ❌ FAIL: date_inlog was not updated!');
    process.exit(1);
  }

  const oldDate = new Date(oldLoginDate);
  const newDate = new Date(newLoginDate);
  const beforeDate = new Date(beforeLogin);

  if (newDate < oldDate) {
    console.error('   ❌ FAIL: New date is earlier than old date!');
    process.exit(1);
  }

  if (newDate < beforeDate) {
    console.error('   ❌ FAIL: New date is earlier than login time!');
    process.exit(1);
  }

  const timeDiff = newDate - oldDate;
  console.log(`   Time difference: ${timeDiff}ms (${(timeDiff / 1000).toFixed(1)}s)`);

  console.log('\n✅ All checks passed!');
  console.log('   ✓ date_inlog field exists in database');
  console.log('   ✓ date_inlog was updated after login');
  console.log('   ✓ New timestamp is more recent than old timestamp');
  console.log('   ✓ New timestamp is current (matches login time)');

  console.log('\n=== Feature #120: VERIFIED ===\n');
}

testLoginDateTracking()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Test failed with error:', err);
    process.exit(1);
  });
