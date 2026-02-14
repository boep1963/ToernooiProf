// Test data isolation between organizations
const http = require('http');

function makeCookieRequest(orgNummer, targetOrgNr, targetEndpoint) {
  const sessionCookie = JSON.stringify({ orgNummer });
  const encodedCookie = encodeURIComponent(sessionCookie);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3008,
      path: targetEndpoint,
      method: 'GET',
      headers: {
        'Cookie': `clubmatch-session=${encodedCookie}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testDataIsolation() {
  console.log('\n=== Testing Data Isolation Between Organizations ===\n');

  // Test 1: Org 1205 accessing own members (should succeed)
  console.log('Test 1: Org 1205 accessing /api/organizations/1205/members');
  try {
    const result1 = await makeCookieRequest(1205, 1205, '/api/organizations/1205/members');
    console.log(`Status: ${result1.statusCode}`);
    console.log(`Members found: ${result1.body?.count || 0}`);
    if (result1.statusCode === 200) {
      console.log('✓ PASS: Org 1205 can access own members\n');
    } else {
      console.log('✗ FAIL: Expected 200, got', result1.statusCode, '\n');
    }
  } catch (error) {
    console.log('✗ FAIL: Request error:', error.message, '\n');
  }

  // Test 2: Org 1205 attempting to access org 1206 members (should fail with 403)
  console.log('Test 2: Org 1205 accessing /api/organizations/1206/members');
  try {
    const result2 = await makeCookieRequest(1205, 1206, '/api/organizations/1206/members');
    console.log(`Status: ${result2.statusCode}`);
    console.log(`Error: ${result2.body?.error || 'N/A'}`);
    if (result2.statusCode === 403) {
      console.log('✓ PASS: Org 1205 CANNOT access org 1206 members (403 Forbidden)\n');
    } else {
      console.log('✗ FAIL: Expected 403, got', result2.statusCode, '\n');
    }
  } catch (error) {
    console.log('✗ FAIL: Request error:', error.message, '\n');
  }

  // Test 3: Org 1206 accessing own members (should succeed)
  console.log('Test 3: Org 1206 accessing /api/organizations/1206/members');
  try {
    const result3 = await makeCookieRequest(1206, 1206, '/api/organizations/1206/members');
    console.log(`Status: ${result3.statusCode}`);
    console.log(`Members found: ${result3.body?.count || 0}`);
    if (result3.statusCode === 200) {
      console.log('✓ PASS: Org 1206 can access own members\n');
    } else {
      console.log('✗ FAIL: Expected 200, got', result3.statusCode, '\n');
    }
  } catch (error) {
    console.log('✗ FAIL: Request error:', error.message, '\n');
  }

  // Test 4: Org 1206 attempting to access org 1205 members (should fail with 403)
  console.log('Test 4: Org 1206 accessing /api/organizations/1205/members');
  try {
    const result4 = await makeCookieRequest(1206, 1205, '/api/organizations/1205/members');
    console.log(`Status: ${result4.statusCode}`);
    console.log(`Error: ${result4.body?.error || 'N/A'}`);
    if (result4.statusCode === 403) {
      console.log('✓ PASS: Org 1206 CANNOT access org 1205 members (403 Forbidden)\n');
    } else {
      console.log('✗ FAIL: Expected 403, got', result4.statusCode, '\n');
    }
  } catch (error) {
    console.log('✗ FAIL: Request error:', error.message, '\n');
  }

  console.log('=== Test Complete ===\n');
}

testDataIsolation().catch(console.error);
