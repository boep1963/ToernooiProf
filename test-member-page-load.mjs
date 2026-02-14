#!/usr/bin/env node

/**
 * Test member page load performance with 100+ members
 */

import https from 'https';
import http from 'http';

const LOGIN_CODE = '1205_AAY@#';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in...');
  const response = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginCode: LOGIN_CODE })
  });

  const cookie = response.headers['set-cookie'];
  if (!cookie) {
    throw new Error('Login failed: no cookie');
  }

  console.log('✅ Logged in successfully');
  return cookie[0].split(';')[0]; // Extract just the session cookie
}

async function testMembersAPI(cookie) {
  console.log('\n📊 Testing /api/organizations/1205/members...');

  const start = Date.now();
  const response = await makeRequest('http://localhost:3000/api/organizations/1205/members', {
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  });
  const duration = Date.now() - start;

  if (response.statusCode !== 200) {
    console.error('❌ API request failed:', response.statusCode);
    console.error(response.body);
    return null;
  }

  const data = JSON.parse(response.body);
  console.log(`   Members count: ${data.count}`);
  console.log(`   API response time: ${duration}ms`);

  if (duration < 3000) {
    console.log('   ✅ Performance PASS (< 3 seconds)');
  } else {
    console.log('   ❌ Performance FAIL (>= 3 seconds)');
  }

  return duration;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Feature #85: Member List Performance Test');
  console.log('='.repeat(60));

  try {
    const cookie = await login();
    const apiTime = await testMembersAPI(cookie);

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`API load time: ${apiTime}ms`);
    console.log(`Status: ${apiTime < 3000 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
