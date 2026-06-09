---
Status: needs-triage
---

## Parent

[PRD.md](../PRD.md)

## What to build

Implement hierarchical nesting for rules using the `parent_rule_id` field. The backend should correctly return nested rules (e.g., Stances under Martial Ka'tah, or Enhancements under a Detachment), and the UI should visually group these child rules within their parent `ArmyRuleCard`.

## Acceptance criteria

- [ ] Repository fetches rules in a structured hierarchy or the service maps flat results into a nested tree.
- [ ] IPC properly returns the nested rule structure to the frontend.
- [ ] The frontend UI visually indents or groups child rules underneath their parent rule correctly.

## Blocked by

- [02-attach-generic-rules.md](./02-attach-generic-rules.md)
