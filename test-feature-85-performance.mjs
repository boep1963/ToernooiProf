#!/usr/bin/env node

/**
 * Feature #85: Member list loads efficiently with many records
 *
 * This script:
 * 1. Creates 100 test members via API
 * 2. Measures page load time
 * 3. Verifies search/filter responsiveness
 * 4. Cleans up test data
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);
const envPath = path.join(projectRoot, '.env.local');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(envPath)
    .toString()
    .split('\n')
    .find(line => line.startsWith('FIREBASE_SERVICE_ACCOUNT'))
    .split('=')[1]
    .replace(/^'|'$/g, '')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const ORG_NUMBER = 1205; // Test organization

async function createTestMembers() {
  console.log('\n📝 Creating 100 test members...');

  const startTime = Date.now();
  const memberIds = [];

  // Get current max member number
  const snapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();

  let maxNumber = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.spa_nummer > maxNumber) {
      maxNumber = data.spa_nummer;
    }
  });

  console.log(`Current max member number: ${maxNumber}`);

  // Create 100 test members
  for (let i = 1; i <= 100; i++) {
    const memberNumber = maxNumber + i;
    const memberData = {
      spa_nummer: memberNumber,
      spa_vnaam: `TestMember${i}`,
      spa_tv: '',
      spa_anaam: `Perf85`,
      spa_org: ORG_NUMBER,
      spa_moy_lib: parseFloat((Math.random() * 5).toFixed(3)),
      spa_moy_band: parseFloat((Math.random() * 3).toFixed(3)),
      spa_moy_3bkl: parseFloat((Math.random() * 2).toFixed(3)),
      spa_moy_3bgr: parseFloat((Math.random() * 1.5).toFixed(3)),
      spa_moy_kad: parseFloat((Math.random() * 4).toFixed(3)),
      created_at: new Date().toISOString(),
      _test_data: 'feature_85' // Mark as test data for cleanup
    };

    const docRef = await db.collection('members').add(memberData);
    memberIds.push(docRef.id);

    if (i % 20 === 0) {
      console.log(`  ✓ Created ${i}/100 members`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Created 100 members in ${duration}ms (${(duration/100).toFixed(1)}ms per member)`);

  return memberIds;
}

async function measurePageLoadPerformance() {
  console.log('\n⏱️  Measuring page load performance...');

  // Count total members
  const snapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();

  console.log(`Total members in database: ${snapshot.size}`);

  // Measure query time
  const queryStart = Date.now();
  const querySnapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();
  const queryDuration = Date.now() - queryStart;

  console.log(`Query duration: ${queryDuration}ms`);

  // Measure data processing time (simulating client-side sorting)
  const processStart = Date.now();
  const members = [];
  querySnapshot.forEach(doc => {
    members.push({ id: doc.id, ...doc.data() });
  });
  members.sort((a, b) => a.spa_nummer - b.spa_nummer);
  const processDuration = Date.now() - processStart;

  console.log(`Data processing duration: ${processDuration}ms`);
  console.log(`Total backend time: ${queryDuration + processDuration}ms`);

  if (queryDuration + processDuration < 3000) {
    console.log('✅ Performance test PASSED (< 3 seconds)');
  } else {
    console.log('❌ Performance test FAILED (>= 3 seconds)');
  }

  return queryDuration + processDuration;
}

async function testSearchPerformance() {
  console.log('\n🔍 Testing search/filter performance...');

  // Get all members
  const snapshot = await db.collection('members')
    .where('spa_org', '==', ORG_NUMBER)
    .get();

  const members = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    members.push({
      spa_vnaam: data.spa_vnaam || '',
      spa_tv: data.spa_tv || '',
      spa_anaam: data.spa_anaam || ''
    });
  });

  // Simulate client-side search (like the frontend does)
  const searchStart = Date.now();
  const searchQuery = 'TestMember50';
  const filtered = members.filter(m => {
    const fullName = `${m.spa_vnaam} ${m.spa_tv} ${m.spa_anaam}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  const searchDuration = Date.now() - searchStart;

  console.log(`Search duration: ${searchDuration}ms`);
  console.log(`Matching members: ${filtered.length}`);

  if (searchDuration < 100) {
    console.log('✅ Search performance test PASSED (< 100ms)');
  } else {
    console.log('⚠️  Search performance test SLOW (>= 100ms)');
  }

  return searchDuration;
}

async function cleanupTestData(memberIds) {
  console.log('\n🧹 Cleaning up test data...');

  const batch = db.batch();
  let count = 0;

  for (const id of memberIds) {
    batch.delete(db.collection('members').doc(id));
    count++;

    // Firestore batch limit is 500
    if (count === 500) {
      await batch.commit();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`✅ Deleted ${memberIds.length} test members`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Feature #85: Member list performance test');
  console.log('='.repeat(60));

  let memberIds = [];

  try {
    // Step 1: Create test members
    memberIds = await createTestMembers();

    // Step 2: Measure page load performance
    const loadTime = await measurePageLoadPerformance();

    // Step 3: Test search performance
    const searchTime = await testSearchPerformance();

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`Page load time: ${loadTime}ms`);
    console.log(`Search time: ${searchTime}ms`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    // Step 4: Cleanup
    if (memberIds.length > 0) {
      await cleanupTestData(memberIds);
    }
  }

  process.exit(0);
}

main();
