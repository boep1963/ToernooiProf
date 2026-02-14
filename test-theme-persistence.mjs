/**
 * Test script for Feature #62: Theme toggle persists across sessions
 *
 * This test verifies that:
 * 1. Theme can be toggled between light and dark
 * 2. Theme preference is saved to localStorage
 * 3. Theme preference persists across page reloads
 * 4. Theme preference persists across browser sessions
 */

import { chromium } from 'playwright';

async function testThemePersistence() {
  console.log('🎨 Testing Feature #62: Theme toggle persists across sessions\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to app
    console.log('Step 1: Navigate to login page...');
    await page.goto('http://localhost:3001/inloggen', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify initial theme (should be light by default)
    let theme = await page.evaluate(() => localStorage.getItem('clubmatch-theme'));
    let hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Initial theme: ${theme || 'not set (defaults to light)'}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    // Step 2: Click theme toggle to set dark theme
    console.log('\nStep 2: Toggle to dark theme...');
    await page.click('button[aria-label*="donker thema"], button[aria-label*="licht thema"]');
    await page.waitForTimeout(500);

    theme = await page.evaluate(() => localStorage.getItem('clubmatch-theme'));
    hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Theme after toggle: ${theme}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    if (theme !== 'dark') {
      throw new Error(`Expected theme to be 'dark', got '${theme}'`);
    }

    // Step 3: Refresh page and verify theme persists
    console.log('\nStep 3: Refresh page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    theme = await page.evaluate(() => localStorage.getItem('clubmatch-theme'));
    hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Theme after refresh: ${theme}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    if (theme !== 'dark') {
      throw new Error(`Expected theme to persist as 'dark' after refresh, got '${theme}'`);
    }
    if (!hasDarkClass) {
      throw new Error('Expected dark class to be applied after refresh');
    }

    // Step 4: Close and reopen browser (new context)
    console.log('\nStep 4: Close and reopen browser...');
    await context.close();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    await page2.goto('http://localhost:3001/inloggen', { waitUntil: 'networkidle' });
    await page2.waitForTimeout(1000);

    theme = await page2.evaluate(() => localStorage.getItem('clubmatch-theme'));
    hasDarkClass = await page2.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Theme in new browser context: ${theme}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    if (theme !== 'dark') {
      throw new Error(`Expected theme to persist as 'dark' in new context, got '${theme}'`);
    }

    // Step 5: Toggle back to light and verify
    console.log('\nStep 5: Toggle back to light theme...');
    await page2.click('button[aria-label*="donker thema"], button[aria-label*="licht thema"]');
    await page2.waitForTimeout(500);

    theme = await page2.evaluate(() => localStorage.getItem('clubmatch-theme'));
    hasDarkClass = await page2.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Theme after toggle: ${theme}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    if (theme !== 'light') {
      throw new Error(`Expected theme to be 'light', got '${theme}'`);
    }
    if (hasDarkClass) {
      throw new Error('Expected dark class to be removed');
    }

    // Step 6: Verify light theme persists
    console.log('\nStep 6: Refresh to verify light theme persists...');
    await page2.reload({ waitUntil: 'networkidle' });
    await page2.waitForTimeout(1000);

    theme = await page2.evaluate(() => localStorage.getItem('clubmatch-theme'));
    hasDarkClass = await page2.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`   Theme after refresh: ${theme}`);
    console.log(`   Has 'dark' class: ${hasDarkClass}`);

    if (theme !== 'light') {
      throw new Error(`Expected theme to persist as 'light', got '${theme}'`);
    }

    await context2.close();
    console.log('\n✅ All theme persistence tests passed!');
    console.log('\nFeature #62 verification complete:');
    console.log('  ✓ Theme can be toggled between light and dark');
    console.log('  ✓ Theme preference is saved to localStorage');
    console.log('  ✓ Theme preference persists across page reloads');
    console.log('  ✓ Theme preference persists across browser sessions');
    console.log('  ✓ Both light and dark themes work correctly');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testThemePersistence()
  .then(() => {
    console.log('\n🎉 Feature #62 is fully functional!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Feature #62 has issues:', error);
    process.exit(1);
  });
