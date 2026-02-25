#!/usr/bin/env node
/**
 * Create a test result for Feature #331 verification
 * This creates a result that we can then edit via the UI
 */

const ORG_NR = 1205;
const COMP_NR = 3;
const PERIOD = 1;

// Create a test result
const resultData = {
  uitslag_code: `${PERIOD}_001_002`,
  sp_1_nr: 1,
  sp_1_cartem: 63,
  sp_1_cargem: 60,
  sp_1_hs: 15,
  sp_2_nr: 2,
  sp_2_cartem: 63,
  sp_2_cargem: 55,
  sp_2_hs: 10,
  brt: 20,
};

const response = await fetch(`http://localhost:3000/api/organizations/${ORG_NR}/competitions/${COMP_NR}/results`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'session=' + process.env.SESSION_COOKIE
  },
  body: JSON.stringify(resultData),
});

if (response.ok) {
  const result = await response.json();
  console.log('✅ Test result created successfully:');
  console.log('   Result ID:', result.id);
  console.log('   Player 1:', result.sp_1_nr, '-', result.sp_1_cargem, 'caramboles');
  console.log('   Player 2:', result.sp_2_nr, '-', result.sp_2_cargem, 'caramboles');
  console.log('   Beurten:', result.brt);
  console.log('\nYou can now test editing this result in the Matrix UI at period', PERIOD);
} else {
  console.error('❌ Failed to create result:', response.status, response.statusText);
  const error = await response.text();
  console.error('Error:', error);
}
