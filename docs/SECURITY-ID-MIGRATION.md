# Uitslagen ID Migration Runbook

This runbook migrates `uitslagen` Firestore document IDs from legacy incremental IDs to tenant-scoped IDs.

## ID Strategy

- Legacy: `<uitslag_id>`
- New: `<orgNummer>_<compNumber>_<uitslagId>`
- Collection path: `ToernooiProf/data/uitslagen`

## Why

- Prevent cross-tenant collisions/overwrites when two tenants produce the same incremental `uitslag_id`.

## Script

- Dry run:
  - `npm run migrate:uitslagen-ids:dry`
- Real migration:
  - `npm run migrate:uitslagen-ids`
- Optional controls:
  - `node scripts/migrate-uitslagen-ids.mjs --limit=500`
  - `node scripts/migrate-uitslagen-ids.mjs --batch-size=200`
  - `node scripts/migrate-uitslagen-ids.mjs --start-after=<docId>`

## Safety and Rollback

- Script writes migration mapping documents to `ToernooiProf/data/legacy_id_map` with key `uitslagen_<legacyDocId>`.
- For each migrated record:
  - creates new tenant-scoped doc,
  - writes mapping record,
  - deletes legacy doc.
- Rollback can be automated by replaying `legacy_id_map` entries in reverse.

## Recommended Rollout

1. Run dry-run and inspect counts.
2. Run with small limit in staging.
3. Validate app behavior and dashboards.
4. Run in production during low traffic window.
5. Keep `legacy_id_map` for audit/recovery.

