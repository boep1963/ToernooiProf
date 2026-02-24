#!/usr/bin/env node

/**
 * Test script for Feature #326 - Backup API
 *
 * Tests the backup API endpoints
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3004';
const BACKUP_SECRET = process.env.BACKUP_CRON_SECRET;

console.log('=== Feature #326: Backup API Test ===\n');

async function runTests() {
  try {
    if (!BACKUP_SECRET) {
      console.error('❌ BACKUP_CRON_SECRET not set in environment');
      process.exit(1);
    }

    console.log('Using backup secret:', BACKUP_SECRET.substring(0, 20) + '...');
    console.log('');

    // Test 1: Create a backup via API
    console.log('Test 1: Creating backup via POST /api/backup/run...');
    const backupResponse = await fetch(`${BASE_URL}/api/backup/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKUP_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backupResponse.ok) {
      const error = await backupResponse.text();
      console.error('❌ Backup API failed:', backupResponse.status, error);
      process.exit(1);
    }

    const backupResult = await backupResponse.json();
    console.log('✅ Backup created successfully:');
    console.log('  - Backup name:', backupResult.backupName);
    console.log('  - Collections:', backupResult.metadata.collections.length);
    console.log('  - Total documents:', backupResult.metadata.totalDocuments);
    console.log('  - Duration:', backupResult.metadata.durationMs, 'ms');
    console.log('  - Collections backed up:', backupResult.metadata.collections.join(', '));
    console.log('');

    // Test 2: Verify unauthorized access is blocked
    console.log('Test 2: Testing authorization...');
    const unauthorizedResponse = await fetch(`${BASE_URL}/api/backup/run`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer wrong-secret',
        'Content-Type': 'application/json',
      },
    });

    if (unauthorizedResponse.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
    } else {
      console.error('❌ Authorization check failed - unauthorized request was not blocked');
      process.exit(1);
    }
    console.log('');

    console.log('=== All Tests Passed ===');
    console.log('Feature #326 backup API is working correctly!');
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

runTests();
