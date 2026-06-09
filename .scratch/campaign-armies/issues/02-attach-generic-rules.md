---
Status: needs-triage
---

## Parent

[PRD.md](../PRD.md)

## What to build

Add the generic `rules` entity to the database and enable attaching these rules to an Army Rulebook, Campaign, or Mission. This includes a Knex migration for the `rules` table, repository updates, and building the `ArmyRuleCard` UI component to render the rules with Markdown support.

## Acceptance criteria

- [ ] Knex migration for the unified `rules` table is created and applied.
- [ ] Repository functions can add, edit, and list rules associated with an `army_rule_id`, `campaign_id`, or `mission_id`.
- [ ] IPC handlers bridge the rules management to the frontend.
- [ ] The `ArmyRuleCard` React component renders the rule data, including rendering the `description` as Markdown.

## Blocked by

- [01-create-army-rulebooks-base-entity.md](./01-create-army-rulebooks-base-entity.md)
