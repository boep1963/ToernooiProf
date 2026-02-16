# Firestore Composite Indexes Documentation

## Overview

This document explains the composite indexes created for the ClubMatch application's Firestore database. These indexes are required for all queries that filter on multiple fields using `.where()` clauses.

## Files Created

1. **firestore.indexes.json** - Contains all 14 composite index definitions
2. **firebase.json** - Updated to reference the indexes file
3. **validate-indexes.mjs** - Validation script to verify index configuration

## Deployment

To deploy these indexes to Firestore:

```bash
firebase deploy --only firestore:indexes --project clubmatch-efd84
```

**Note:** Index creation in Firestore can take several minutes to several hours depending on the size of existing data.

## Index Summary

Total composite indexes: **14**

### By Collection

| Collection | Indexes | Purpose |
|------------|---------|---------|
| competitions | 1 | Lookup competitions by organization and competition number |
| competition_players | 3 | Find players in competitions, handle multiple field name variations |
| results | 3 | Query results by competition, period, and match code |
| members | 1 | Lookup members by organization and member number |
| matches | 3 | Find matches by competition, period, and match code |
| tables | 1 | Lookup table status by organization and table number |
| score_helpers | 1 | Find live scores for specific matches |
| device_config | 1 | Lookup device configuration (mouse/tablet) per table |

## Detailed Index Definitions

### 1. competitions (org_nummer, comp_nr)
**Purpose:** Lookup a specific competition by organization and competition number

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/route.ts` (GET)
- `/api/organizations/[orgNr]/competitions/[compNr]/standings/[period]/route.ts` (line 34-38)
- `/api/organizations/[orgNr]/competitions/[compNr]/results/route.ts` (line 164-168)
- `/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts` (line 86-90)
- And 8+ other files

**Example query:**
```javascript
db.collection('competitions')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .limit(1)
  .get()
```

---

### 2. competition_players (spc_org, spc_competitie)
**Purpose:** Get all players in a specific competition

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/players/route.ts` (line 32-35)
- `/api/organizations/[orgNr]/competitions/[compNr]/standings/[period]/route.ts` (line 51-54)

**Example query:**
```javascript
db.collection('competition_players')
  .where('spc_org', '==', 1205)
  .where('spc_competitie', '==', 1)
  .get()
```

---

### 3. competition_players (spc_org, spc_competitie, spc_nummer)
**Purpose:** Check if a specific player is already in a competition (duplicate detection)

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/players/route.ts` (line 144-149)

**Example query:**
```javascript
db.collection('competition_players')
  .where('spc_org', '==', 1205)
  .where('spc_competitie', '==', 1)
  .where('spc_nummer', '==', 42)
  .limit(1)
  .get()
```

---

### 4. competition_players (org_nummer, comp_nr, spa_nr)
**Purpose:** Alternative field naming for player lookup (used in WRV scoring calculations)

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/results/route.ts` (line 205-210, 211-216)

**Example query:**
```javascript
db.collection('competition_players')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('spa_nr', '==', 42)
  .limit(1)
  .get()
```

---

### 5. results (org_nummer, comp_nr)
**Purpose:** Get all results for a competition

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/results/route.ts` (line 46-48)

**Example query:**
```javascript
db.collection('results')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .get()
```

---

### 6. results (org_nummer, comp_nr, periode)
**Purpose:** Get all results for a specific competition period (used in standings calculation)

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/standings/[period]/route.ts` (line 94-98)

**Example query:**
```javascript
db.collection('results')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('periode', '==', 1)
  .get()
```

---

### 7. results (org_nummer, comp_nr, uitslag_code)
**Purpose:** Check if a result already exists for a specific match (duplicate prevention)

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/results/route.ts` (line 275-279)

**Example query:**
```javascript
db.collection('results')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('uitslag_code', '==', '1_42_43')
  .limit(1)
  .get()
```

---

### 8. members (spa_org, spa_nummer)
**Purpose:** Lookup member details by organization and member number

**Used by:**
- `/api/organizations/[orgNr]/members/[memberNr]/route.ts`
- `/api/organizations/[orgNr]/competitions/[compNr]/players/route.ts` (line 158-162)
- `/api/organizations/[orgNr]/competitions/[compNr]/standings/[period]/route.ts` (line 74-78)
- `/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts` (line 142-146)
- And 5+ other files for name enrichment

**Example query:**
```javascript
db.collection('members')
  .where('spa_org', '==', 1205)
  .where('spa_nummer', '==', 42)
  .limit(1)
  .get()
```

---

### 9. matches (org_nummer, comp_nr)
**Purpose:** Get all matches for a competition

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts` (line 32-35)

**Example query:**
```javascript
db.collection('matches')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .get()
```

---

### 10. matches (org_nummer, comp_nr, periode)
**Purpose:** Get all matches for a specific competition period

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts` (line 254-258)

**Example query:**
```javascript
db.collection('matches')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('periode', '==', 1)
  .get()
```

---

### 11. matches (org_nummer, comp_nr, uitslag_code)
**Purpose:** Find a specific match by its match code (for scoreboards and result submission)

**Used by:**
- `/api/organizations/[orgNr]/competitions/[compNr]/results/route.ts` (line 299-304)
- `/api/organizations/[orgNr]/scoreboards/[tableNr]/route.ts` (line 74-78, 223-228)

**Example query:**
```javascript
db.collection('matches')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('uitslag_code', '==', '1_42_43')
  .limit(1)
  .get()
```

---

### 12. tables (org_nummer, tafel_nr)
**Purpose:** Get table status for a specific table (which match is assigned, current status)

**Used by:**
- `/api/organizations/[orgNr]/scoreboards/[tableNr]/route.ts` (line 38-41, 155-158)

**Example query:**
```javascript
db.collection('tables')
  .where('org_nummer', '==', 1205)
  .where('tafel_nr', '==', 1)
  .get()
```

---

### 13. score_helpers (org_nummer, comp_nr, uitslag_code)
**Purpose:** Get live score data for a specific match on a scoreboard

**Used by:**
- `/api/organizations/[orgNr]/scoreboards/[tableNr]/route.ts` (line 55-59, 215-219)

**Example query:**
```javascript
db.collection('score_helpers')
  .where('org_nummer', '==', 1205)
  .where('comp_nr', '==', 1)
  .where('uitslag_code', '==', '1_42_43')
  .get()
```

---

### 14. device_config (org_nummer, tafel_nr)
**Purpose:** Get device configuration (mouse vs tablet) for a specific table

**Used by:**
- `/api/organizations/[orgNr]/scoreboards/device/[tableNr]/route.ts` (line 26-29, 84-87)

**Example query:**
```javascript
db.collection('device_config')
  .where('org_nummer', '==', 1205)
  .where('tafel_nr', '==', 1)
  .get()
```

---

## Important Notes

### Namespace Prefix

All collections in this application are stored under the `ClubMatch/data/` namespace in Firestore. This is handled automatically by the database abstraction layer (`src/lib/db.ts`), but it's important to understand that:

- Application code references: `db.collection('competitions')`
- Actual Firestore path: `ClubMatch/data/competitions`

The indexes use collection group queries (`collectionGroup: "competitions"`) which work across all collection paths, so they will match the namespaced collections correctly.

### Index Build Time

After deploying indexes:
- Small datasets (<1000 docs): Indexes build in 1-5 minutes
- Medium datasets (1000-10000 docs): Indexes build in 10-30 minutes
- Large datasets (>10000 docs): Indexes can take hours

You can monitor index build progress in the Firebase Console:
1. Go to Firestore Database
2. Click "Indexes" tab
3. Watch for status to change from "Building" to "Enabled"

### Query Performance

Without these indexes, queries will:
- Work fine during development with small datasets
- Start returning `FAILED_PRECONDITION` errors as data grows
- Fail completely in production with thousands of documents

With these indexes, queries:
- Run in milliseconds regardless of dataset size
- Scale efficiently to millions of documents
- Support real-time scoreboards and live standings

### Maintenance

If you add new query patterns with multiple `.where()` clauses:
1. Firestore will show an error message with a link to auto-create the index
2. Alternatively, manually add the index to `firestore.indexes.json`
3. Redeploy with `firebase deploy --only firestore:indexes`

## Testing

To verify all indexes are working:
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait for indexes to finish building (check Firebase Console)
3. Test critical flows: standings calculation, match generation, scoreboard display
4. Monitor for any `FAILED_PRECONDITION` errors in server logs

## Validation

Run the validation script to verify the configuration:

```bash
node validate-indexes.mjs
```

Expected output:
```
JSON validation: PASS
Number of indexes: 14
Field overrides: 0

Index coverage:
  competitions: 1 index(es)
  competition_players: 3 index(es)
  results: 3 index(es)
  members: 1 index(es)
  matches: 3 index(es)
  tables: 1 index(es)
  score_helpers: 1 index(es)
  device_config: 1 index(es)

All validations passed!
```

## Troubleshooting

### "Index not found" errors
- Wait for indexes to finish building (can take time)
- Check Firebase Console indexes tab for build status
- Verify indexes are marked as "Enabled"

### "Requires an index" errors
- This means a new query pattern was added that needs an index
- Click the link in the error message to auto-create it
- Or manually add to firestore.indexes.json

### Deployment fails
- Verify JSON syntax with `node validate-indexes.mjs`
- Check Firebase project ID matches in `.firebaserc`
- Ensure you have permission to deploy indexes

## References

- [Firebase Composite Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [ClubMatch Application Specification](./app_spec.txt)
- [Database Abstraction Layer](./src/lib/db.ts)
