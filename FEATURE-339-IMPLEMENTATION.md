# Feature #339: Waarschuwing - Vast beurten afwijkend bij wijziging uitslag

## Implementation Summary

**Feature**: When editing an existing result in a competition with fixed turns (vast_beurten), show a warning after clicking "Controle" if the number of turns differs from the fixed amount. User can accept or adjust.

**Status**: ✅ COMPLETED

## Changes Made

### 1. Added State Variable (line 98)
```typescript
const [showBeurtenWarning, setShowBeurtenWarning] = useState(false);
```

### 2. Modified "Controle" Button Handler (lines 1083-1107)

Added warning check after validation passes:
```typescript
// Feature #339: Waarschuwing bij afwijkend aantal beurten bij vast beurten
// Check if editing existing result AND vast_beurten enabled AND brt differs from max_beurten
if (
  selectedMatch?.resultId &&
  competition?.vast_beurten === 1 &&
  competition?.max_beurten &&
  Number(formData.brt) !== competition.max_beurten
) {
  setError('');
  setShowBeurtenWarning(true);
  return;
}
```

**Logic**:
- Only triggers when EDITING an existing result (not for new results)
- Only when vast_beurten is enabled (vast_beurten === 1)
- Only when entered brt differs from max_beurten
- Shows warning modal and stops progression to Step 2

### 3. Created Warning Modal (after line 1225)

Modal features:
- **Title**: "Afwijkend aantal beurten"
- **Message**: Shows entered beurten vs. fixed beurten values
- **Icon**: Amber warning triangle (not red, since it's a warning not an error)
- **Two Buttons**:
  - "Aanpassen" (Adjust) - Closes modal, stays on Step 1 so user can fix
  - "Accepteren" (Accept) - Closes modal, proceeds to Step 2 (Controle preview)

```typescript
{/* Beurten Warning Modal - Feature #339 */}
{showBeurtenWarning && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl...">
      // ... modal content with warning icon and message
      <button onClick={() => setShowBeurtenWarning(false)}>Aanpassen</button>
      <button onClick={() => {
        setShowBeurtenWarning(false);
        setModalStep(2);
      }}>Accepteren</button>
    </div>
  </div>
)}
```

## Behavior Flow

### Scenario: Editing Result with Different Beurten

1. User opens Matrix page for competition with vast_beurten=1, max_beurten=30
2. User clicks existing result cell (e.g., result with 30 beurten)
3. Result form opens in edit mode with pre-filled data
4. User changes "Aantal beurten" from 30 to 25
5. User clicks "Controle" button
6. **Warning modal appears**:
   - Title: "Afwijkend aantal beurten"
   - Message: "Het ingevoerde aantal beurten (25) wijkt af van het vaste aantal beurten (30) dat is ingesteld voor deze competitie."
   - Question: "Wilt u dit accepteren of het aantal beurten aanpassen?"
7. User has two options:
   - **Click "Aanpassen"**: Modal closes, form stays on Step 1, user can edit beurten
   - **Click "Accepteren"**: Modal closes, form proceeds to Step 2 (Controle preview)
8. If user accepts, they can continue to save the result with the different beurten value

### When Warning Does NOT Appear

- ❌ Creating a NEW result (only for editing existing results)
- ❌ Competition has vast_beurten=0 (not enabled)
- ❌ Entered beurten equals max_beurten (no difference)
- ❌ Any validation errors (warnings only show after validation passes)

## Integration with Other Features

- **Feature #332**: Pre-fill beurten with max_beurten for new results when vast_beurten enabled
- **Feature #333**: Validation that beurten > 0 (runs before warning)
- **Feature #334**: Validation that beurten ≤ max_beurten (runs before warning)
- **Feature #335**: Skip gemaakt > te maken validation when vast_beurten enabled

## Files Modified

- `src/app/(dashboard)/competities/[id]/matrix/page.tsx`:
  - Line 98: Added `showBeurtenWarning` state variable
  - Lines 1089-1100: Added warning check in "Controle" button handler
  - Lines 1228-1265: Added warning modal UI

## Verification Checklist

✅ Code compiles successfully (npm run build passed)
✅ TypeScript type checking passed (no errors in matrix/page.tsx)
✅ Matrix page builds: 6.52 kB (production build)
✅ Warning only triggers for existing results (checks selectedMatch?.resultId)
✅ Warning only triggers when vast_beurten=1
✅ Warning only triggers when beurten differs from max_beurten
✅ Warning shows after validation passes (not before)
✅ "Aanpassen" button closes modal and stays on Step 1
✅ "Accepteren" button closes modal and proceeds to Step 2
✅ Modal UI matches app design (amber warning, dark mode support)
✅ Clear Dutch messages explaining the issue

## UI/UX Details

- **Modal Z-index**: z-50 (appears above all other content)
- **Backdrop**: Semi-transparent black (bg-black/50)
- **Warning Color**: Amber (not red) - indicates warning, not error
- **Icon**: Triangle with exclamation mark
- **Button Colors**:
  - "Aanpassen": Gray outline (secondary action)
  - "Accepteren": Amber solid (primary action)
- **Dark Mode**: Fully supported with proper contrast
- **Responsive**: Works on mobile, tablet, desktop (max-w-md container)

## Test Scenarios

### Test 1: Warning Appears (Happy Path)
1. Competition: vast_beurten=1, max_beurten=30
2. Edit existing result with brt=30
3. Change brt to 25
4. Click "Controle"
5. ✅ Warning modal appears
6. Click "Accepteren"
7. ✅ Proceeds to Step 2

### Test 2: User Adjusts Value
1. Same setup as Test 1
2. Warning appears
3. Click "Aanpassen"
4. ✅ Modal closes, stays on Step 1
5. Change brt back to 30
6. Click "Controle"
7. ✅ No warning, proceeds to Step 2

### Test 3: New Result (No Warning)
1. Competition: vast_beurten=1, max_beurten=30
2. Click empty cell (new result)
3. Enter brt=25 (different from 30)
4. Click "Controle"
5. ✅ No warning, proceeds to Step 2 directly

### Test 4: No Vast Beurten (No Warning)
1. Competition: vast_beurten=0
2. Edit existing result
3. Change brt to any value
4. Click "Controle"
5. ✅ No warning (feature only applies to vast_beurten competitions)

## Production Ready

✅ Zero TypeScript errors
✅ Zero console errors (implementation does not introduce new errors)
✅ Production build successful
✅ Code follows existing patterns
✅ Proper null safety checks
✅ Accessible (keyboard navigation works)
✅ Internationalized (Dutch labels)
✅ Responsive design
✅ Dark mode support

## Conclusion

Feature #339 is **fully implemented and production-ready**. The warning modal correctly alerts users when editing results with different beurten values in fixed-turns competitions, while allowing them to either adjust or accept the deviation.
