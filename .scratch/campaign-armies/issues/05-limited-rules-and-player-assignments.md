---
Status: needs-triage
---

## Parent

[PRD.md](../PRD.md)

## What to build

Add support for assigning specific rules (like limited Enhancements or Artefacts) directly to players, respecting configured limits. This introduces the `player_rules` associative table, parses the `max_per_player` and `max_campaign_wide` metadata JSON attributes in the backend validation, and updates the UI so Game Masters can assign these rules to a player's roster.

## Acceptance criteria

- [ ] Knex migration for `player_rules` table is created and applied.
- [ ] Backend logic validates assignment requests against `max_per_player` and `max_campaign_wide` limits stored in the rule's `metadata`.
- [ ] The UI allows Game Masters to assign specific rule instances to a player.
- [ ] The UI prevents assignment and shows an error if a limit is exceeded.

## Blocked by

- [02-attach-generic-rules.md](./02-attach-generic-rules.md)
- [04-link-player-selection-to-army-rulebooks.md](./04-link-player-selection-to-army-rulebooks.md)
