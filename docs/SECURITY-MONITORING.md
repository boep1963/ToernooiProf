# Security Monitoring Checklist

## Mutation Audit Logs

Critical mutation routes now emit structured JSON logs with `type: "mutation_audit"`:

- `delete_poule_players`
- `generate_matches`
- `delete_result`
- `doorkoppelen`

### Suggested alerting

- Alert on unusually high mutation volume per `orgNummer` in short windows.
- Alert on high 401/403 rates for competition routes (ID probing signal).
- Alert on repeated rate-limit 429 responses from same IP.

## Operational checks

- Run `npm run test:security` in CI for every PR touching API routes.
- Run `npm run migrate:uitslagen-ids:dry` before production migration.
- Keep `legacy_id_map` records for forensic tracing and rollback.

