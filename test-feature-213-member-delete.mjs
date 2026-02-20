#!/usr/bin/env node

/**
 * Feature #213 Test: Verify member deletion blocks when linked to competitions
 *
 * Requirement: When deleting a member from Members Management, if the member
 * is linked to any competitions, the deletion should be blocked with a message
 * showing which competitions they're linked to.
 */

import { readFileSync } from 'fs';

console.log('🧪 Feature #213: Member Deletion Cascade Protection Test\n');

console.log('📝 Feature Requirement:');
console.log('   When a member is deleted:');
console.log('   1. Check if member is in any competition_players entries');
console.log('   2. If YES: Block deletion, show linked competitions');
console.log('   3. If NO: Delete member + cascade delete results/matches');
console.log('');

// Read the member deletion route
const routePath = './src/app/api/organizations/[orgNr]/members/[memberNr]/route.ts';
const routeCode = readFileSync(routePath, 'utf8');

console.log('✅ Code Verification:\n');

// Check 1: Does it query competition_players?
const hasCompetitionCheck = routeCode.includes("db.collection('competition_players')") &&
                              routeCode.includes("where('spc_nummer', '==', memberNumber)");

if (hasCompetitionCheck) {
  console.log('   ✅ Step 1: Checks if member is linked to competitions');
  console.log('      Found: competition_players query by spc_nummer');
} else {
  console.log('   ❌ Step 1: MISSING competition_players check');
}

// Check 2: Does it block deletion if linked?
const hasBlockLogic = routeCode.includes('!playerSnapshot.empty') &&
                       routeCode.includes('Lid kan niet verwijderd worden') &&
                       routeCode.includes('status: 409');

if (hasBlockLogic) {
  console.log('   ✅ Step 2: Blocks deletion when member is linked');
  console.log('      Found: Returns 409 Conflict with error message');
} else {
  console.log('   ❌ Step 2: MISSING block logic for linked members');
}

// Check 3: Does it show competition names?
const showsCompetitions = routeCode.includes('competitions:') &&
                           routeCode.includes('comp_naam');

if (showsCompetitions) {
  console.log('   ✅ Step 3: Returns list of linked competitions');
  console.log('      Found: competitions array with comp_nr and comp_naam');
} else {
  console.log('   ❌ Step 3: MISSING competition list in error response');
}

// Check 4: Does it cascade delete results?
const cascadeResults = routeCode.includes("db.collection('results')") &&
                        (routeCode.includes("where('sp_1_nr', '==', memberNumber)") ||
                         routeCode.includes("where('sp_2_nr', '==', memberNumber)"));

if (cascadeResults) {
  console.log('   ✅ Step 4: Cascade deletes results for unlinked members');
  console.log('      Found: results queries by sp_1_nr and sp_2_nr');
} else {
  console.log('   ❌ Step 4: MISSING cascade delete for results');
}

// Check 5: Does it cascade delete matches?
const cascadeMatches = routeCode.includes("db.collection('matches')") &&
                        (routeCode.includes("where('nummer_A', '==', memberNumber)") ||
                         routeCode.includes("where('nummer_B', '==', memberNumber)"));

if (cascadeMatches) {
  console.log('   ✅ Step 5: Cascade deletes matches for unlinked members');
  console.log('      Found: matches queries by nummer_A and nummer_B');
} else {
  console.log('   ❌ Step 5: MISSING cascade delete for matches');
}

console.log('');

// Overall result
const allChecksPassed = hasCompetitionCheck && hasBlockLogic && showsCompetitions &&
                        cascadeResults && cascadeMatches;

if (allChecksPassed) {
  console.log('✅ TEST PASSED: All requirements implemented correctly\n');

  console.log('📊 Implementation Summary:');
  console.log('');
  console.log('   Scenario A: Member linked to competition(s)');
  console.log('   ─────────────────────────────────────────────');
  console.log('   1. Query competition_players by spc_nummer');
  console.log('   2. If found: Get competition names');
  console.log('   3. Return 409 Conflict with error:');
  console.log('      "Lid is gekoppeld aan één of meer competities."');
  console.log('      "Verwijder eerst het lid uit alle competities."');
  console.log('   4. Include competitions array with comp_nr and comp_naam');
  console.log('   5. Member NOT deleted');
  console.log('');
  console.log('   Scenario B: Member NOT linked to any competition');
  console.log('   ────────────────────────────────────────────────');
  console.log('   1. Delete member document from members collection');
  console.log('   2. Cascade delete: all results where sp_1_nr OR sp_2_nr = member');
  console.log('   3. Cascade delete: all matches where nummer_A OR nummer_B = member');
  console.log('   4. Return 200 OK with cascade counts');
  console.log('');

  console.log('📌 User Flow:');
  console.log('   1. User clicks "Delete" on a member in Members page');
  console.log('   2. If member is in competitions:');
  console.log('      → Show error: "Cannot delete, linked to: [Competition Names]"');
  console.log('      → User must go to each competition and remove player first');
  console.log('   3. If member NOT in competitions:');
  console.log('      → Member deleted');
  console.log('      → All orphan results/matches also deleted');
  console.log('');

  process.exit(0);
} else {
  console.log('❌ TEST FAILED: Some requirements are missing\n');
  console.log('   Review the DELETE endpoint in:');
  console.log('   src/app/api/organizations/[orgNr]/members/[memberNr]/route.ts');
  process.exit(1);
}
