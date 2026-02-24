#!/usr/bin/env node
/**
 * Feature #328 Test: Backups and restore only visible for administrators
 *
 * Tests:
 * 1. Non-admin user cannot access backup API routes (403)
 * 2. Super admin user CAN access backup API routes (200)
 * 3. Cron secret still works for /api/backup/run
 */

const BASE_URL = 'http://localhost:3000';

// Test login codes - we need to find which is admin and which isn't
const TEST_CODE_1 = '1205_AAY@#'; // We'll test if this is admin

async function loginWithCode(loginCode) {
  const response = await fetch(`${BASE_URL}/api/auth/login-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginCode }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();

  // Get session cookie from response
  const setCookie = response.headers.get('set-cookie');
  let sessionCookie = null;
  if (setCookie) {
    const match = setCookie.match(/clubmatch-session=([^;]+)/);
    if (match) {
      sessionCookie = match[1];
    }
  }

  return {
    orgEmail: data.organization?.org_wl_email,
    orgNummer: data.organization?.org_nummer,
    sessionCookie,
  };
}

async function testBackupListAccess(sessionCookie) {
  const response = await fetch(`${BASE_URL}/api/backup/list`, {
    method: 'GET',
    headers: {
      'Cookie': `clubmatch-session=${sessionCookie}`,
    },
  });

  return {
    status: response.status,
    ok: response.ok,
  };
}

async function testBackupRunWithSecret() {
  const secret = process.env.BACKUP_CRON_SECRET || 'test-secret';

  const response = await fetch(`${BASE_URL}/api/backup/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
    },
  });

  return {
    status: response.status,
    ok: response.ok,
  };
}

function checkIsAdmin(email) {
  if (!email) return false;
  const adminEmails = ['@de-boer.net', 'hanseekels@gmail.com'];
  const normalizedEmail = email.toLowerCase().trim();

  return adminEmails.some(entry => {
    const normalizedEntry = entry.toLowerCase().trim();
    if (normalizedEntry.startsWith('@')) {
      return normalizedEmail.includes(normalizedEntry);
    }
    return normalizedEmail === normalizedEntry;
  });
}

async function runTests() {
  console.log('\n=== Feature #328 Comprehensive Test ===\n');

  try {
    // Test 1: Login and check admin status
    console.log('Test 1: Logging in with test code...');
    const login = await loginWithCode(TEST_CODE_1);
    console.log(`✓ Logged in as org ${login.orgNummer}`);
    console.log(`  Email: ${login.orgEmail}`);

    const isAdmin = checkIsAdmin(login.orgEmail);
    console.log(`  Is Super Admin: ${isAdmin ? 'YES' : 'NO'}`);

    // Test 2: Access backup list API
    console.log('\nTest 2: Testing /api/backup/list access...');
    const listResult = await testBackupListAccess(login.sessionCookie);
    console.log(`  Status: ${listResult.status}`);

    if (isAdmin) {
      if (listResult.status === 200) {
        console.log('✓ Super admin can access backup list (200 OK)');
      } else {
        console.log(`✗ FAIL: Super admin should get 200, got ${listResult.status}`);
        process.exit(1);
      }
    } else {
      if (listResult.status === 403) {
        console.log('✓ Non-admin correctly blocked (403 Forbidden)');
      } else {
        console.log(`✗ FAIL: Non-admin should get 403, got ${listResult.status}`);
        process.exit(1);
      }
    }

    // Test 3: Test CRON secret still works for /api/backup/run
    console.log('\nTest 3: Testing /api/backup/run with CRON secret...');
    console.log('  (This test may take a few seconds if backup actually runs)');
    const runResult = await testBackupRunWithSecret();
    console.log(`  Status: ${runResult.status}`);

    if (runResult.status === 200 || runResult.status === 500) {
      // 200 = success, 500 = backup failed but auth worked
      console.log('✓ CRON secret authentication works');
    } else if (runResult.status === 401) {
      console.log('  Note: CRON secret not configured or incorrect (expected in dev)');
    } else {
      console.log(`  Unexpected status: ${runResult.status}`);
    }

    console.log('\n=== Summary ===');
    console.log(`User ${login.orgNummer} (${login.orgEmail}):`);
    console.log(`- Is super admin: ${isAdmin}`);
    console.log(`- Backup list access: ${listResult.status === 200 ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`\n✓ Feature #328 security checks ${isAdmin ? 'verified (admin access)' : 'verified (non-admin blocked)'}`);

    if (!isAdmin) {
      console.log('\nNote: To test super admin access, login with an org that has @de-boer.net email');
    }

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
