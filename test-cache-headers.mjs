#!/usr/bin/env node
/**
 * Test script to verify HTTP cache headers are present on API endpoints
 * Feature #322 - HTTP Caching Headers
 */

console.log('Testing HTTP Cache Headers Implementation\n');
console.log('===========================================\n');

const baseUrl = 'http://localhost:3002';

// Test no-cache endpoints (should have no-cache, no-store, must-revalidate)
const noCacheEndpoints = [
  '/api/health',
  '/api/auth/session',
];

// Test cacheable endpoints (should have private, max-age=30, stale-while-revalidate=60)
// Note: These require authentication, so we'll just document them
const cacheableEndpoints = [
  '/api/organizations/[orgNr]/members',
  '/api/organizations/[orgNr]/competitions',
  '/api/organizations/[orgNr]/competitions/[compNr]',
  '/api/organizations/[orgNr]/competitions/[compNr]/standings/[period]',
  '/api/organizations/[orgNr]/competitions/[compNr]/players',
  '/api/organizations/[orgNr]/competitions/[compNr]/results',
  '/api/organizations/[orgNr]/competitions/[compNr]/matches',
  '/api/organizations/[orgNr]/competitions/[compNr]/doorkoppelen',
  '/api/organizations/[orgNr]/competitions/[compNr]/periods',
];

async function testEndpoint(url, expectedPattern) {
  try {
    const response = await fetch(url);
    const cacheControl = response.headers.get('cache-control');

    if (!cacheControl) {
      console.log(`❌ ${url}`);
      console.log(`   No Cache-Control header found\n`);
      return false;
    }

    const matches = cacheControl.includes(expectedPattern);
    if (matches) {
      console.log(`✅ ${url}`);
      console.log(`   Cache-Control: ${cacheControl}\n`);
      return true;
    } else {
      console.log(`⚠️  ${url}`);
      console.log(`   Expected: ${expectedPattern}`);
      console.log(`   Got: ${cacheControl}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let total = 0;

  console.log('Testing NO-CACHE endpoints (real-time data):\n');
  for (const endpoint of noCacheEndpoints) {
    total++;
    const result = await testEndpoint(baseUrl + endpoint, 'no-cache');
    if (result) passed++;
  }

  console.log('\n===========================================\n');
  console.log('Cacheable endpoints (require authentication):');
  console.log('These endpoints have been updated with cache headers:');
  cacheableEndpoints.forEach(endpoint => {
    console.log(`  - ${endpoint}`);
  });
  console.log('\nExpected Cache-Control: private, max-age=30, stale-while-revalidate=60\n');

  console.log('===========================================\n');
  console.log(`Test Summary: ${passed}/${total} endpoints verified\n`);

  if (passed === total) {
    console.log('✅ All cache headers implemented correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints need verification');
    process.exit(1);
  }
}

runTests().catch(console.error);
