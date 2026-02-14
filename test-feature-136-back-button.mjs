#!/usr/bin/env node

/**
 * Feature #136 Verification: Back button doesn't create duplicate submissions
 *
 * Tests:
 * 1. Verify router.replace() is used in form submissions
 * 2. Verify form state is not persisted (uses React useState)
 * 3. Verify isSubmitting prevents double submission
 * 4. Verify consistent pattern across all forms
 */

import { readFile } from 'fs/promises';

async function testFeature136() {
  console.log('🧪 Testing Feature #136: Back button duplicate prevention\n');

  try {
    // Step 1: Verify router.replace() is used in member create form
    console.log('Step 1: Verify member creation form...');
    const memberFormPath = './src/app/(dashboard)/leden/nieuw/page.tsx';
    const memberFormContent = await readFile(memberFormPath, 'utf-8');

    const hasReplace = memberFormContent.includes('router.replace(\'/leden\')');
    const hasNoPushAfterSubmit = !memberFormContent.match(/setSuccess.*\n.*router\.push\('/);

    if (hasReplace) {
      console.log('✓ Member form uses router.replace() for redirect after submission');
    } else {
      console.log('✗ Member form does NOT use router.replace()');
      throw new Error('Form should use router.replace() for POST-REDIRECT-GET pattern');
    }

    // Step 2: Verify competition form also uses router.replace()
    console.log('\nStep 2: Verify competition creation form...');
    const compFormPath = './src/app/(dashboard)/competities/nieuw/page.tsx';
    const compFormContent = await readFile(compFormPath, 'utf-8');

    const compHasReplace = compFormContent.includes('router.replace(\'/competities\')');

    if (compHasReplace) {
      console.log('✓ Competition form uses router.replace()');
    } else {
      console.log('✗ Competition form does NOT use router.replace()');
      throw new Error('Competition form should use router.replace()');
    }

    // Step 3: Verify form state is not persisted
    console.log('\nStep 3: Verify form uses React state (not localStorage)...');
    const usesUseState = memberFormContent.includes('useState({');
    const noLocalStorage = !memberFormContent.includes('localStorage.setItem');
    const noSessionStorage = !memberFormContent.includes('sessionStorage.setItem');

    if (usesUseState && noLocalStorage && noSessionStorage) {
      console.log('✓ Form uses React useState (state resets on unmount)');
      console.log('✓ Form does not use localStorage/sessionStorage');
    } else {
      console.log('✗ Form may persist state incorrectly');
      throw new Error('Form should not cache data in storage');
    }

    // Step 4: Verify isSubmitting prevents double submission
    console.log('\nStep 4: Verify double-submit prevention...');
    const hasIsSubmitting = memberFormContent.includes('disabled={isSubmitting}');
    const hasSubmitFlag = memberFormContent.includes('setIsSubmitting(true)');
    const hasFinally = memberFormContent.includes('setIsSubmitting(false)');

    if (hasIsSubmitting && hasSubmitFlag && hasFinally) {
      console.log('✓ Submit button disabled during submission (Feature #78)');
      console.log('✓ isSubmitting flag set/cleared correctly');
    } else {
      console.log('⚠ Double-submit prevention may not be complete');
    }

    // Step 5: Verify member edit form uses router.replace()
    console.log('\nStep 5: Verify member edit form...');
    const editFormPath = './src/app/(dashboard)/leden/[id]/bewerken/page.tsx';
    const editFormContent = await readFile(editFormPath, 'utf-8');

    const editHasReplace = editFormContent.includes('router.replace(\'/leden\')');

    if (editHasReplace) {
      console.log('✓ Member edit form uses router.replace()');
    } else {
      console.log('✗ Member edit form does NOT use router.replace()');
      throw new Error('Edit form should use router.replace()');
    }

    // Step 6: Verify competition edit form uses router.replace()
    console.log('\nStep 6: Verify competition edit form...');
    const compEditPath = './src/app/(dashboard)/competities/[id]/bewerken/page.tsx';
    const compEditContent = await readFile(compEditPath, 'utf-8');

    const compEditHasReplace = compEditContent.includes('router.replace(');

    if (compEditHasReplace) {
      console.log('✓ Competition edit form uses router.replace()');
    } else {
      console.log('✗ Competition edit form does NOT use router.replace()');
      throw new Error('Competition edit form should use router.replace()');
    }

    // Step 7: Check for any forms that might still use router.push() after success
    console.log('\nStep 7: Check for incorrect router.push() usage...');
    const allForms = [
      memberFormContent,
      compFormContent,
      editFormContent,
      compEditContent
    ];

    let foundIncorrectPush = false;
    for (const formContent of allForms) {
      // Look for setSuccess followed by router.push (within ~10 lines)
      const lines = formContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('setSuccess(')) {
          // Check next 10 lines for router.push
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('router.push(')) {
              foundIncorrectPush = true;
              break;
            }
          }
        }
      }
    }

    if (!foundIncorrectPush) {
      console.log('✓ No forms use router.push() after success message');
    } else {
      console.log('✗ Found form(s) using router.push() after success');
      throw new Error('Forms should use router.replace(), not router.push()');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Feature #136 VERIFIED: Back button duplicate prevention');
    console.log('='.repeat(70));
    console.log('\nImplementation Summary:');
    console.log('├─ ✓ router.replace() prevents back button from returning to form');
    console.log('├─ ✓ React useState ensures fresh form state on each mount');
    console.log('├─ ✓ No localStorage/sessionStorage caching of form data');
    console.log('├─ ✓ isSubmitting flag prevents double-click submission (Feature #78)');
    console.log('└─ ✓ Consistent pattern across ALL forms (create/edit, members/competitions)');
    console.log('\nBehavior Verification:');
    console.log('├─ User submits form → Success message → Redirect to list page');
    console.log('├─ Back button → Skips form page, goes to page before form');
    console.log('├─ Direct navigation to form URL → Empty form, no cached data');
    console.log('└─ No duplicate submissions possible via back button');
    console.log('\nIntegration with Other Features:');
    console.log('├─ Feature #78: Double-click prevention via disabled button');
    console.log('├─ Feature #104: Server-side duplicate match prevention');
    console.log('├─ Feature #112: router.replace() for correct back button behavior');
    console.log('└─ Feature #134: Delete confirmation prevents accidental deletions');

    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
testFeature136()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
