---
Status: needs-triage
---

## Parent

[PRD.md](../PRD.md)

## What to build

Create the base `army_rules` and `army_rule_shares` entities. This involves a database migration, the corresponding repository to manage CRUD operations, an IPC layer to handle communication, and a simple UI screen to create, view, and share these root-level abstract rulebooks.

## Acceptance criteria

- [ ] Knex migration for `army_rules` and `army_rule_shares` tables is created and applied.
- [ ] Backend repository `army-rules-repo.ts` and service `army-rules-service.ts` can create, retrieve, update, and share rulebooks.
- [ ] IPC handlers are implemented and bound in `src/renderer/api.ts`.
- [ ] A basic React UI screen allows the user to create a new Army Rulebook with a name and description.

## Blocked by

None - can start immediately
