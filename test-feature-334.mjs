#!/usr/bin/env node
/**
 * Test Feature #334: Validatie - Beurten niet groter dan maximaal aantal beurten
 *
 * This script tests that entering a number of beurten exceeding max_beurten
 * shows a validation error and prevents saving.
 */

import { chromium } from 'playwright';

async function testFeature334() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📋 Test Feature #334: Max beurten validation\n');

    // Step 1: Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/inloggen');
    await page.waitForLoadState('networkidle');

    // Step 2: Login
    console.log('2. Logging in...');
    await page.getByRole('textbox', { name: 'Inlogcode' }).fill('1205_AAY@#');
    await page.getByRole('button', { name: 'Inloggen' }).click();
    await page.waitForURL('**/dashboard');
    console.log('   ✅ Login successful');

    // Step 3: Navigate to Matrix page
    console.log('3. Navigating to competition 3 Matrix page...');
    await page.goto('http://localhost:3000/competities/3/matrix');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Matrix', { timeout: 10000 });
    console.log('   ✅ Matrix page loaded');

    // Step 4: Click on a match cell to open result form
    console.log('4. Opening result form for a match...');
    const matchCell = await page.locator('button:has-text("Klik om uitslag in te voeren")').first();
    await matchCell.click();
    await page.waitForSelector('text=Uitslag invoeren', { timeout: 5000 });
    console.log('   ✅ Result form opened');

    // Step 5: Fill in the form with valid data except beurten
    console.log('5. Filling in result form...');
    const spinbuttons = await page.getByRole('spinbutton').all();

    // Player A: Gemaakt (should be index 1, as index 0 is disabled Te maken)
    await spinbuttons[1].fill('63');
    // Player A: Hoogste serie (index 2)
    await spinbuttons[2].fill('20');
    // Player B: Gemaakt (index 4)
    await spinbuttons[4].fill('50');
    // Player B: Hoogste serie (index 5)
    await spinbuttons[5].fill('15');
    console.log('   ✅ Player scores filled');

    // Step 6: Enter beurten exceeding max_beurten (use 100 as a test value)
    console.log('6. Testing validation with beurten = 100...');
    const beurtenField = spinbuttons[6]; // Last spinbutton should be Aantal beurten
    await beurtenField.fill('100');
    console.log('   ⏳ Filled beurten = 100');

    // Step 7: Click Controle to trigger validation
    console.log('7. Clicking Controle button...');
    await page.getByRole('button', { name: 'Controle' }).click();

    // Wait a bit for validation to run
    await page.waitForTimeout(1000);

    // Step 8: Check if error message appears
    console.log('8. Checking for validation error...');
    const errorMessage = await page.locator('text=/Aantal beurten.*mag niet groter zijn/i').textContent({ timeout: 3000 }).catch(() => null);

    if (errorMessage) {
      console.log('   ✅ PASS: Validation error displayed:');
      console.log(`      "${errorMessage}"`);
      console.log('\n✅ Feature #334 validation is working correctly!');
      return true;
    } else {
      // No error - check if we moved to step 2 (Controle page)
      const isOnControlePage = await page.locator('text=Controle').count() > 0 && await page.locator('text=Terug').count() > 0;

      if (isOnControlePage) {
        console.log('   ❌ FAIL: No validation error - moved to Controle step');
        console.log('   This means max_beurten is not set or is >= 100 for this competition');
        console.log('\n   Need to test with a competition that has max_beurten < 100');
        return false;
      } else {
        console.log('   ⚠️  Could not determine validation state');
        return false;
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testFeature334().then(success => {
  process.exit(success ? 0 : 1);
});
