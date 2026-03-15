const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return readFileSync(path.join(root, relPath), 'utf8');
}

test('doorkoppelen route enforces org auth guard', () => {
  const file = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/doorkoppelen/route.ts');
  assert.match(file, /validateOrgAccess\(request,\s*orgNr\)/);
});

test('poule players delete is tenant scoped', () => {
  const file = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/poules/[pouleId]/players/route.ts');
  assert.match(file, /\.where\('poule_id',\s*'==',\s*pouleId\)/);
  assert.match(file, /\.where\('org_nummer',\s*'==',\s*orgNummer\)/);
  assert.match(file, /\.where\('comp_nr',\s*'==',\s*compNumber\)/);
});

test('matches route validates poule ownership before mutation', () => {
  const file = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts');
  assert.match(file, /assertPouleOwnership\(orgNummer,\s*compNumber,\s*String\(pouleId\)\)/);
});

test('new uitslagen writes use tenant-scoped document ids', () => {
  const startRoute = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/start/route.ts');
  const finalizeRoute = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/rounds/finalize/route.ts');
  const matchesRoute = read('src/app/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts');

  assert.match(startRoute, /buildUitslagDocId\(/);
  assert.match(finalizeRoute, /buildUitslagDocId\(/);
  assert.match(matchesRoute, /buildUitslagDocId\(/);

  assert.doesNotMatch(startRoute, /collection\('uitslagen'\)\.doc\(String\(/);
  assert.doesNotMatch(finalizeRoute, /collection\('uitslagen'\)\.doc\(String\(/);
  assert.doesNotMatch(matchesRoute, /collection\('uitslagen'\)\.doc\(String\(/);
});

test('test-persistence route is restricted', () => {
  const file = read('src/app/api/test-persistence/route.ts');
  assert.match(file, /validateSuperAdmin\(request\)/);
  assert.match(file, /process\.env\.NODE_ENV === 'production'/);
});

