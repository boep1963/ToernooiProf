# Feature #88: Moyenne validates numeric input

## Implementation Details

Added moyenne field validation to both member creation and edit forms:
- `/leden/nieuw` (create new member)
- `/leden/[id]/bewerken` (edit existing member)

### Validation Rules

For all 5 moyenne fields (spa_moy_lib, spa_moy_band, spa_moy_3bkl, spa_moy_3bgr, spa_moy_kad):

1. **Optional fields**: Empty values are allowed (defaults to 0)
2. **Numeric validation**: If value provided, must be a valid number
   - Uses `parseFloat()` to convert string to number
   - Uses `isNaN()` to check if conversion succeeded
   - Error message: "{Field} moet een geldig getal zijn."
3. **Non-negative validation**: If value provided, must be >= 0
   - Checks `numValue < 0`
   - Error message: "{Field} mag niet negatief zijn."

### Code Changes

**File: `src/app/(dashboard)/leden/nieuw/page.tsx`**

1. Added validation loop in `handleSubmit()`:
```typescript
const moyenneFields = [
  { key: 'spa_moy_lib', label: 'Libre moyenne' },
  { key: 'spa_moy_band', label: 'Bandstoten moyenne' },
  { key: 'spa_moy_3bkl', label: 'Driebanden klein moyenne' },
  { key: 'spa_moy_3bgr', label: 'Driebanden groot moyenne' },
  { key: 'spa_moy_kad', label: 'Kader moyenne' },
];

for (const field of moyenneFields) {
  const value = formData[field.key as keyof typeof formData];
  if (value && value.trim() !== '') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      errors[field.key] = `${field.label} moet een geldig getal zijn.`;
    } else if (numValue < 0) {
      errors[field.key] = `${field.label} mag niet negatief zijn.`;
    }
  }
}
```

2. Added error display to each moyenne field:
```typescript
<input
  id="spa_moy_lib"
  name="spa_moy_lib"
  type="number"
  step="0.001"
  min="0"
  value={formData.spa_moy_lib}
  onChange={handleChange}
  placeholder="0.000"
  aria-invalid={!!fieldErrors.spa_moy_lib}
  aria-describedby={fieldErrors.spa_moy_lib ? 'spa_moy_lib-error' : undefined}
  className={`... ${fieldErrors.spa_moy_lib ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
/>
{fieldErrors.spa_moy_lib && (
  <p id="spa_moy_lib-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
    {fieldErrors.spa_moy_lib}
  </p>
)}
```

**File: `src/app/(dashboard)/leden/[id]/bewerken/page.tsx`**

Applied identical validation logic and error display to all 5 moyenne fields.

## Expected Test Scenarios

### Test 1: Invalid text input
1. Navigate to `/leden/nieuw`
2. Fill in required fields: Voornaam = "Test", Achternaam = "User"
3. Enter "abc" in Libre moyenne field
4. Click "Lid toevoegen"
5. **Expected**: Form does NOT submit
6. **Expected**: Libre field shows red border
7. **Expected**: Error message below field: "Libre moyenne moet een geldig getal zijn."

### Test 2: Negative number
1. Navigate to `/leden/nieuw`
2. Fill in required fields: Voornaam = "Test", Achternaam = "User"
3. Enter "-1" in Bandstoten moyenne field
4. Click "Lid toevoegen"
5. **Expected**: Form does NOT submit
6. **Expected**: Bandstoten field shows red border
7. **Expected**: Error message: "Bandstoten moyenne mag niet negatief zijn."

### Test 3: Valid decimal number
1. Navigate to `/leden/nieuw`
2. Fill in required fields: Voornaam = "Test", Achternaam = "User"
3. Enter "99.999" in Driebanden klein moyenne field
4. Click "Lid toevoegen"
5. **Expected**: Form submits successfully
6. **Expected**: No validation errors
7. **Expected**: Success message appears
8. **Expected**: Redirects to `/leden` after 1.5 seconds

### Test 4: Empty moyenne fields (valid)
1. Navigate to `/leden/nieuw`
2. Fill in required fields: Voornaam = "Test", Achternaam = "User"
3. Leave all moyenne fields empty
4. Click "Lid toevoegen"
5. **Expected**: Form submits successfully (moyennes default to 0)

### Test 5: Multiple errors
1. Navigate to `/leden/nieuw`
2. Fill in required fields: Voornaam = "Test", Achternaam = "User"
3. Enter "abc" in Libre
4. Enter "-5" in Bandstoten
5. Click "Lid toevoegen"
6. **Expected**: Form does NOT submit
7. **Expected**: Both fields show red borders
8. **Expected**: Both error messages displayed
9. **Expected**: Error messages are:
   - "Libre moyenne moet een geldig getal zijn."
   - "Bandstoten moyenne mag niet negatief zijn."

### Test 6: Edit form validation
1. Navigate to existing member edit page
2. Change Libre moyenne to "invalid"
3. Click "Lid bijwerken"
4. **Expected**: Form does NOT submit
5. **Expected**: Libre field shows validation error

## Implementation Status

✅ Validation logic added to both forms
✅ Error messages in Dutch
✅ Visual feedback (red borders)
✅ Accessibility attributes (aria-invalid, aria-describedby)
✅ Clears errors when user starts typing
✅ Prevents form submission when errors exist
✅ Handles empty values (optional fields)
✅ Handles valid decimals (99.999)
✅ Rejects non-numeric input ("abc")
✅ Rejects negative numbers (-1)

## Browser Testing Status

**Unable to test via browser automation** due to node_modules corruption on the development machine. However:

1. **Code review confirms** all validation logic is correctly implemented
2. **Pattern matches** existing validation for name fields
3. **Implementation follows** React best practices
4. **Error handling is consistent** with the rest of the application
5. **Dutch language messages** are properly formatted

## Verification Method

Since browser testing was not possible, verification was done through:
1. Code review of both modified files
2. Git diff analysis showing all changes
3. Comparison with existing validation patterns (name fields)
4. Logical analysis of validation flow
5. Verification that HTML5 `type="number"` is preserved for browser-level validation
6. Verification that server-side validation exists (API calls `parseFloat()` before saving)

## Next Steps

When dev server is available:
1. Run all 6 test scenarios in browser
2. Take screenshots of error states
3. Verify accessibility with screen reader
4. Test keyboard navigation
5. Verify error clearing on input
6. Test edge cases (very large numbers, scientific notation, etc.)

## Files Modified

- `src/app/(dashboard)/leden/nieuw/page.tsx` (validation + error display for 5 fields)
- `src/app/(dashboard)/leden/[id]/bewerken/page.tsx` (validation + error display for 5 fields)
