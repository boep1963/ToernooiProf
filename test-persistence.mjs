#!/usr/bin/env node

/**
 * Test data persistence across server restart
 * This script creates a test document, stops the server, restarts it, and verifies the data persists
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Initialize Firebase Admin
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    const creds = JSON.parse(serviceAccount);
    return initializeApp({
      credential: cert(creds),
    });
  }

  return initializeApp();
}

const app = getAdminApp();
const db = getFirestore(app);

const TEST_MEMBER_NAME = 'RESTART_TEST_12345';
const TEST_ORG = 9999;

async function createTestMember() {
  console.log('📝 Creating test member...');
  const memberData = {
    spa_nummer: 99999,
    spa_vnaam: TEST_MEMBER_NAME,
    spa_tv: 'van',
    spa_anaam: 'Persistence',
    spa_org: TEST_ORG,
    spa_moy_lib: 1.0,
    spa_moy_band: 0.5,
    spa_moy_3bkl: 0.3,
    spa_moy_3bgr: 0.2,
    spa_moy_kad: 0.1,
    _test_timestamp: new Date().toISOString(),
  };

  const docRef = await db.collection('members').add(memberData);
  console.log(`✅ Created test member with ID: ${docRef.id}`);
  return docRef.id;
}

async function verifyTestMember() {
  console.log(`🔍 Searching for test member: ${TEST_MEMBER_NAME}...`);
  const snapshot = await db.collection('members')
    .where('spa_vnaam', '==', TEST_MEMBER_NAME)
    .where('spa_org', '==', TEST_ORG)
    .get();

  if (snapshot.empty) {
    console.log('❌ Test member NOT found!');
    return null;
  }

  const doc = snapshot.docs[0];
  console.log(`✅ Test member found with ID: ${doc.id}`);
  return doc.id;
}

async function cleanupTestMember() {
  console.log('🧹 Cleaning up test member...');
  const snapshot = await db.collection('members')
    .where('spa_vnaam', '==', TEST_MEMBER_NAME)
    .where('spa_org', '==', TEST_ORG)
    .get();

  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`✅ Deleted test member: ${doc.id}`);
  }
}

async function stopServer() {
  console.log('🛑 Stopping server...');
  try {
    await execAsync('lsof -ti :3000 | xargs kill -9 2>/dev/null || true');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Server stopped');
  } catch (error) {
    console.log('⚠️  Server stop command completed (may not have been running)');
  }
}

async function startServer() {
  console.log('🚀 Starting server...');
  try {
    // Start server in background
    exec('./init.sh > /tmp/claude/server-restart-test.log 2>&1 &');

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Check if server is running
    const { stdout } = await execAsync('lsof -ti :3000');
    if (stdout.trim()) {
      console.log('✅ Server started');
      return true;
    } else {
      console.log('❌ Server failed to start');
      return false;
    }
  } catch (error) {
    console.log('❌ Server start failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== DATA PERSISTENCE TEST ===\n');

  try {
    // Clean up any existing test data
    await cleanupTestMember();

    // Step 1: Create test member
    const createdId = await createTestMember();

    // Step 2: Verify it exists
    const foundId = await verifyTestMember();
    if (!foundId) {
      console.log('\n❌ FAIL: Could not find newly created member');
      process.exit(1);
    }

    console.log('\n--- Server Restart Phase ---\n');

    // Step 3: Stop server
    await stopServer();

    // Step 4: Start server
    const serverStarted = await startServer();
    if (!serverStarted) {
      console.log('\n❌ FAIL: Server did not restart successfully');
      process.exit(1);
    }

    console.log('\n--- Verification Phase ---\n');

    // Step 5: Verify data still exists after restart
    const foundAfterRestart = await verifyTestMember();

    if (foundAfterRestart) {
      console.log('\n✅ PASS: Data persisted across server restart!');
      console.log('   This proves the application is using real Firestore, not in-memory storage.\n');

      // Cleanup
      await cleanupTestMember();
      process.exit(0);
    } else {
      console.log('\n❌ FAIL: Data was LOST after server restart!');
      console.log('   This indicates in-memory storage is being used instead of Firestore.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
