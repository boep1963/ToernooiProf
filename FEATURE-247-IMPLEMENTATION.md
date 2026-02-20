# Feature #247: Scoreborden Fundamenteel Herontwerp

## STATUS: IMPLEMENTATION COMPLETE - REQUIRES CONSULTATION & MANUAL TESTING

## Summary

Implemented the fundamental scoreboard redesign based on PHP reference architecture. The key distinction between mouse and tablet modes is now correctly implemented according to ClubMatch_H (PHP) specification.

## Problem Statement

The current Next.js implementation incorrectly shows interactive buttons on BOTH mouse and tablet mode scoreboards. According to the PHP reference implementation, tablet mode should have a fundamentally different architecture:

- **Display**: Completely passive, no buttons
- **Control**: Separate tablet interface with all controls

## Implementation Details

### Architecture Changes

**BEFORE (Incorrect):**
- Both mouse mode AND tablet mode showed interactive buttons on scoreboard display
- No separate control interface for tablet mode
- Violated the fundamental requirement from PHP reference

**AFTER (Correct):**
- **Mouse Mode (soort=1)**: Scoreboard shows all interactive buttons (UNCHANGED - already correct)
- **Tablet Mode (soort=2)**: Scoreboard is PASSIVE DISPLAY ONLY with NO buttons
- **Tablet Control Panel**: NEW separate interface at `/scoreborden/tablet-control/[tafelNr]`

### Files Created

1. **src/app/(dashboard)/scoreborden/tablet-control/[tafelNr]/page.tsx** (NEW - 617 lines)
   - Complete tablet control panel interface
   - Match assignment
   - Match start/cancel controls
   - Score input controls
   - Turn management
   - Real-time polling (3 second intervals)

### Files Modified

2. **src/app/(dashboard)/scoreborden/[tafelNr]/page.tsx**
   - REMOVED all interactive buttons from tablet mode display
   - Changed waiting state: removed "Wedstrijd toewijzen" button
   - Changed assigned state: removed "Start partij" and "Annuleren" buttons
   - Changed playing state: removed ALL scoring control buttons
   - Added passive messages
   - Mouse mode remains UNCHANGED

## PHP Reference Analysis

### Mouse Mode Flow (soort=1)
```
Kies_bediening.php
  -> if soort==1 -> Toon_tafel.php
  -> Shows ALL buttons on scoreboard
```

### Tablet Mode Flow (soort=2)
```
Kies_bediening.php
  -> if soort==2 -> Modus_wachten.php (PASSIVE)
  -> Shows "Wachten op partij" with NO buttons
  -> Auto-refreshes every 5 seconds

Control happens separately in:
Tablet_bediening.php (separate URL)
  -> All interactive controls
  -> Score input
  -> Match management
```

## Two-Device Workflow

### Setup:
1. **Display Device** (large screen): Navigate to `/scoreborden/[tafelNr]`
   - Shows passive scoreboard
   - No touch interaction needed
   - Auto-updates via polling

2. **Control Device** (tablet): Navigate to `/scoreborden/tablet-control/[tafelNr]`
   - All interactive controls here
   - Match assignment
   - Score input
   - Match management

### Workflow Example:

1. Display shows: "Wachten op partij" (passive)
2. On tablet: Click "Wedstrijd toewijzen" -> select match
3. Display updates: Shows "Wedstrijd toegewezen" with player names (passive)
4. On tablet: Click "Start partij"
5. Display updates: Shows live score (passive)
6. On tablet: Input scores with buttons
7. Display updates: Shows updated scores in real-time
8. On tablet: Click "Klaar" when match finished
9. Display shows: Final result (passive)

## Technical Implementation

### State Synchronization
- Both interfaces poll API endpoint every 3 seconds
- Control panel POST actions update database
- Display automatically reflects changes on next poll
- No WebSockets needed (polling is sufficient)

## Verification Checklist

### Mouse Mode (soort=1) - SHOULD STILL WORK
- Navigate to scoreboard with mouse mode
- Verify all buttons still appear
- Verify all functionality works as before

### Tablet Mode (soort=2) - NEW BEHAVIOR
- Configure table as tablet mode
- Navigate to scoreboard display - verify NO buttons
- Navigate to tablet control panel - verify buttons appear
- Test two-device workflow end-to-end

## Known Limitations

1. **No Wissel Spelers**: Not implemented yet (shows alert)
2. **No Herstel**: Not implemented yet (shows alert)
3. **Polling Only**: Uses 3-second polling instead of WebSockets
4. **No Queue System**: Match assignment is manual

## Breaking Changes

None - mouse mode behavior is completely unchanged. Only tablet mode changes affect users who use soort=2.

## Recommendations for Product Owner

This feature requires **consultation and approval** before marking as complete:

1. **Validate Architecture**: Confirm two-device workflow matches requirements
2. **UX Review**: Approve the separation of display vs control
3. **Hardware Testing**: Test with actual large display + tablet setup
4. **User Documentation**: Create setup guide for two-device mode
5. **Queue System**: Decide on dagplanning integration approach

## Build Status

✅ Compilation successful
✅ TypeScript checks pass
✅ Next.js build completes
⚠️  Manual testing required

## Next Steps

1. Product owner review and approval
2. Manual testing with real hardware
3. User acceptance testing
4. Documentation creation
5. Feature completion or iteration based on feedback

---

**Implementation Date:** 2026-02-20
**Feature ID:** #247
**Status:** IMPLEMENTED - AWAITING CONSULTATION
**Files Changed:** 2 (1 new, 1 modified)
**Lines of Code:** ~767 lines
