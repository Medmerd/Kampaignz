# 1. Terminology: Army vs Army Rules

Date: 2026-06-08

## Status

Accepted

## Context

We need a structured way to store the myriad of rules (Detachments, Stratagems, Enhancements, Crusade Rules) for the factions that players use in tabletop campaigns (e.g., Warhammer 40k Codexes). Initially, the proposed PRD referred to this abstract collection of rules as a "Campaign Army". However, in tabletop gaming, the term "Army" strongly implies a specific player's concrete list or roster of units, rather than the abstract faction rulebook itself.

If we overloaded the term "Army" to mean both the abstract rulebook and the concrete player roster, it would lead to significant confusion in the codebase, database schema, and UI.

## Decision

We will strictly split the terminology:
- **Army Rules**: Refers exclusively to the abstract rulebook/template (e.g., the "Adepta Sororitas 10th Edition Index" or custom homebrew rules) containing Detachments, Stratagems, etc.
- **Army**: Reserved exclusively for a specific player's curated roster of units and models.

The database table previously proposed as `campaign_armies` will instead be named `army_rules`. The individual game rules inside it will be stored in a polymorphic `rules` table.

## Consequences

- Clear distinction between templates (Army Rules) and concrete implementations (Armies).
- Developers and users will immediately understand whether a feature is modifying faction rules or modifying a player's specific unit loadouts.
- We must update the `PRD.md` to rename `campaign_armies` to `army_rules`, and `campaign_army_shares` to `army_rule_shares`.
