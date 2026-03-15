# Security Inventory: Incremental IDs and API Manipulation

This document captures confirmed vulnerabilities and mitigation status for IDOR-style attacks and manipulated API requests.

## Confirmed Risks

- `GET/POST /api/organizations/[orgNr]/competitions/[compNr]/doorkoppelen`
  - **Risk:** Missing authz check on path IDs (`orgNr`, `compNr`).
  - **Impact:** Unauthorized read and update of moyennes.
  - **Status:** Fixed by enforcing `validateOrgAccess` + competition existence guard.

- `DELETE /api/organizations/[orgNr]/competitions/[compNr]/poules/[pouleId]/players`
  - **Risk:** Delete based on `poule_id` only.
  - **Impact:** Cross-tenant deletes when IDs collide/overlap.
  - **Status:** Fixed by ownership guard and scoped delete query (`poule_id + org_nummer + comp_nr`).

- `POST /api/organizations/[orgNr]/competitions/[compNr]/matches` with `poule_id`
  - **Risk:** `poule_id` from request body not verified against tenant scope.
  - **Impact:** Cross-tenant reads/mutations for match generation.
  - **Status:** Fixed by `assertPouleOwnership` and scoped queries.

- `/api/test-persistence` (GET/POST/DELETE)
  - **Risk:** Unauthenticated mutation endpoint.
  - **Impact:** Unauthorized data changes.
  - **Status:** Fixed by super-admin check and non-production guard.

- `POST /api/organizations`
  - **Risk:** Unauthenticated organization creation endpoint.
  - **Impact:** Arbitrary tenant creation / abuse.
  - **Status:** Fixed by super-admin authz and endpoint-specific rate limiting.

- `uitslagen` Firestore doc IDs
  - **Risk:** Global incremental `doc(String(uitslagId))` could collide across tenants.
  - **Impact:** Cross-tenant overwrite/collision risk.
  - **Status:** Fixed for new writes by tenant-scoped doc ID `${orgNummer}_${compNumber}_${uitslagId}`.

- Session cookie integrity
  - **Risk:** Unsigned cookie accepted by direct JSON parse.
  - **Impact:** Cookie tampering can elevate scope.
  - **Status:** Fixed by signed session cookies (HMAC) with strict decode path.

## Hardening Patterns Applied

- Server-side ownership checks for resource IDs before mutations.
- Scoped queries for destructive operations.
- Signed session cookies with centralized decode.
- Rate limiting on sensitive mutation flows.
- Defensive request parsing for numbers/arrays/enums.

