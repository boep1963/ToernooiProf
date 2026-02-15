#!/usr/bin/env node

/**
 * Test script for Feature #155 - Admin Menu Item visibility
 * Verifies that the admin check logic works correctly
 */

// Inline the isSuperAdmin function for testing
const ADMIN_EMAILS = [
  '@de-boer.net',
  'hanseekels@gmail.com',
];

function isSuperAdmin(email) {
  if (!email || typeof email !== 'string') return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((entry) => {
    const normalizedEntry = entry.toLowerCase().trim();
    if (normalizedEntry.startsWith('@')) {
      return normalizedEmail.includes(normalizedEntry);
    }
    return normalizedEmail === normalizedEntry;
  });
}

console.log('\n=== Feature #155 Admin Check Logic Tests ===\n');

const tests = [
  { email: 'p@de-boer.net', expected: true, reason: 'Domain match' },
  { email: 'test@de-boer.net', expected: true, reason: 'Domain match' },
  { email: 'hanseekels@gmail.com', expected: true, reason: 'Exact email match' },
  { email: 'HANSEEKELS@GMAIL.COM', expected: true, reason: 'Case insensitive' },
  { email: 'pieter@testclub.nl', expected: false, reason: 'Non-admin email' },
  { email: 'user@other.com', expected: false, reason: 'Non-admin email' },
  { email: null, expected: false, reason: 'Null email' },
  { email: undefined, expected: false, reason: 'Undefined email' },
  { email: '', expected: false, reason: 'Empty email' },
];

let passed = 0;
let failed = 0;

tests.forEach(({ email, expected, reason }) => {
  const result = isSuperAdmin(email);
  const status = result === expected ? '✅' : '❌';

  if (result === expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(`${status} ${String(email).padEnd(25)} => ${String(result).padEnd(5)} (${reason})`);
});

console.log(`\n=== Results: ${passed}/${tests.length} tests passed ===\n`);

if (failed > 0) {
  console.log('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
  process.exit(0);
}
