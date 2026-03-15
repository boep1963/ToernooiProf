const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return readFileSync(path.join(root, relPath), 'utf8');
}

test('auth helper uses centralized signed session decoder', () => {
  const file = read('src/lib/auth-helper.ts');
  assert.match(file, /decodeSessionCookie/);
  assert.doesNotMatch(file, /JSON\.parse\(sessionCookie\.value\)/);
});

test('auth routes set signed session cookies', () => {
  const login = read('src/app/api/auth/login/route.ts');
  const loginCode = read('src/app/api/auth/login-code/route.ts');
  const register = read('src/app/api/auth/register/route.ts');
  const verify = read('src/app/api/auth/verify/route.ts');

  for (const file of [login, loginCode, register, verify]) {
    assert.match(file, /encodeSessionCookie\(/);
    assert.match(file, /SESSION_COOKIE_NAME/);
  }
});

