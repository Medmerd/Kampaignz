---
Status: needs-triage
---

## Parent

[PRD.md](../PRD.md)

## What to build

Connect the existing `players` table to the new `army_rules` table. This slice alters the database schema to add an `army_rule_id` foreign key to `players`. The frontend UI for creating or editing a player must be updated to present a dropdown or selection of available Army Rulebooks rather than a free-text input.

## Acceptance criteria

- [ ] Knex migration alters the `players` table to add `army_rule_id` (foreign key to `army_rules`).
- [ ] Player repository and service handle the new `army_rule_id` field.
- [ ] The player management UI is updated to select a faction from the list of created Army Rulebooks.

## Blocked by

- [01-create-army-rulebooks-base-entity.md](./01-create-army-rulebooks-base-entity.md)
