---
Status: needs-triage
---

## Problem Statement

Game Masters managing Table Top campaigns currently lack a structured way to define, store, and share complex rules text for the factions their players (or NPCs) use. The rulebooks (such as the Warhammer 40k Codexes or Index PDFs) contain heavily nested and varied rules—ranging from Army Rules and Detachments to Stratagems, Enhancements, and Crusade Rules. There is no existing data model in Kampaignz to capture an "Army Rules" entity (the abstract rulebook), link these myriad rules to it, and allow sharing this entity across different campaigns without re-entering data.

## Solution

Introduce an `army_rules` data model to represent a fixed abstract rulebook entity that belongs to a campaign but can be shared across multiple campaigns. Alongside this, create a flexible, polymorphic `rules` structure that allows Game Masters to attach different types of game rules (e.g., Detachment Rules, Enhancements, Stratagems, Crusade Agendas) to the Army Rules rulebook. This structured approach will allow the UI to display rich, contextual rule information directly in the app, eliminating the need to cross-reference external PDFs during a session.

## User Stories

1. As a Game Master, I want to create new "Army Rules" (an abstract rulebook, e.g., "Adepta Sororitas" or "Adeptus Custodes") within my current campaign, so that I can track the faction mechanics being used.
2. As a Game Master, I want to share existing Army Rules with another campaign, so that I don't have to re-input all the rules for a recurring faction.
3. As a Game Master, I want to add top-level mechanics (e.g., Acts of Faith, Martial Ka'tah) to the Army Rules, so that the faction's overarching mechanics are recorded.
4. As a Game Master, I want to nest sub-rules under main rules (e.g., adding specific "Stances" under the "Martial Ka'tah" Army Rule), so that complex tiered rules are clearly organized.
5. As a Game Master, I want to add "Detachments" to Army Rules, so that I can capture sub-faction specific rules.
6. As a Game Master, I want to attach "Enhancements" to a specific Detachment, so that players know what upgrades are available to their characters.
7. As a Game Master, I want to attach "Stratagems" to a specific Detachment, including their CP cost and phase, so that players have a quick reference for tactical options.
8. As a Game Master, I want to add complex "Crusade Rules" (Agendas, Requisitions, Endeavours, Dishonours, Artefacts) to the Army Rules, so that deep narrative progression mechanics are tracked.
9. As a Game Master, I want to add alternate play mode rules (e.g., "Boarding Actions" specific Detachments and Mustering Rules) to the Army Rules, so that different game scales are supported.
10. As a Player, I want to view all the rules associated with my selected Army Rules in an organized UI, so that I can quickly reference them during gameplay.
11. As a Game Master, I want to apply rich text/markdown formatting to rule descriptions, so that keywords, dice rolls, and effects are clearly emphasized.
12. As a Game Master, I want to add game rules that are campaign-wide, so that I can apply overarching effects to armies for the whole or part of a campaign.
13. As a Game Master, I want to attach specific game rules to a mission, so that unique scenarios or environmental effects are tracked.
14. As a Game Master, I want player faction selection to use the defined Army Rules as the source, so that a player is directly linked to the specific structured rules for their faction.
15. As a Game Master, I want to set complex maximum limits on specific game rules (e.g., maximum instances per player, or maximum instances campaign-wide), so that unique items or abilities remain balanced across the campaign.
16. As a Game Master, I want to assign an instance of a game rule directly to a specific player, so that we can track who holds a unique item, benefit, or penalty.

## Implementation Decisions

- **New Database Tables (via Knex migrations):**
  - `army_rules`: `id`, `name`, `description`, `original_campaign_id`, `created_at`, `updated_at`. (This acts as the root abstract rulebook entity).
  - `army_rule_shares`: `campaign_id`, `army_rule_id` (composite primary key) to link an Army Rulebook to multiple campaigns.
  - `rules`: `id`, `army_rule_id` (nullable), `campaign_id` (nullable), `mission_id` (nullable), `rule_category` (Enum/String: 'Army Rule', 'Detachment', 'Enhancement', 'Stratagem', 'Crusade Rule', 'Boarding Action', 'Sub-Rule', 'Campaign Rule', 'Mission Rule'), `name`, `description` (Markdown supported), `metadata` (JSON column for rule-specific data including CP cost, phases, target restrictions, and complex limited rule configurations such as `max_per_player` and `max_campaign_wide`), `parent_rule_id` (nullable, heavily used to nest Stances under main rules, or Enhancements/Stratagems under Detachments).
  - `player_rules`: `id`, `rule_id`, `player_id`, `created_at` (used to track which player holds a specific instance of a rule).
- **Altered Database Tables:**
  - `players`: Add `army_rule_id INTEGER` (foreign key to `army_rules(id)`). The existing `army` text column will be migrated to the new relation where possible or deprecated.

### Database Schema (SQL)

```sql
CREATE TABLE IF NOT EXISTS army_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    original_campaign_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS army_rule_shares (
    campaign_id INTEGER NOT NULL,
    army_rule_id INTEGER NOT NULL,
    PRIMARY KEY (campaign_id, army_rule_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (army_rule_id) REFERENCES army_rules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    army_rule_id INTEGER,
    campaign_id INTEGER,
    mission_id INTEGER,
    rule_category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    metadata JSON,
    parent_rule_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (army_rule_id) REFERENCES army_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    CHECK (
        (army_rule_id IS NOT NULL AND campaign_id IS NULL AND mission_id IS NULL) OR
        (army_rule_id IS NULL AND campaign_id IS NOT NULL AND mission_id IS NULL) OR
        (army_rule_id IS NULL AND campaign_id IS NULL AND mission_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS player_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Note: SQLite ALTER TABLE ADD COLUMN does not easily support all foreign key constraints depending on version,  
-- but conceptually we are adding a relationship from players to army_rules.
ALTER TABLE players ADD COLUMN army_rule_id INTEGER REFERENCES army_rules(id) ON DELETE SET NULL;
```

- **Backend Modules:**
  - `src/main/migrations/`: New migration files for the above schemas.
  - `src/main/repositories/army-rules-repo.ts`: Methods for CRUD operations on abstract rulebooks and their individual rules, including the sharing mechanism.
  - `src/main/services/army-rules-service.ts`: Business logic to validate rule hierarchies (e.g., ensuring an Enhancement is linked to a Detachment if required).
  - `src/main/ipc/army-rules-ipc.ts`: IPC handlers to expose army rule management to the frontend.
- **Frontend Modules:**
  - `src/renderer/api.ts`: Add bindings for the new IPC endpoints.
  - `src/renderer/screens/ArmyRulesScreen.tsx`: New screen for managing and viewing an Army Rules rulebook.
  - `src/renderer/components/ArmyRuleCard.tsx`: Reusable UI component to display a rule, applying specific Ant Design styling based on the `rule_type` (e.g., distinct visual cues for Stratagems vs. Enhancements).

## Testing Decisions

- **What makes a good test:** Tests should verify the external behavior of the repository without mocking the database. This includes ensuring foreign key constraints work (e.g., deleting a rulebook deletes its nested rules) and that the sharing mechanism doesn't duplicate the record.
- **Modules to be tested:** `army-rules-repo.ts` and `army-rules-service.ts`.
- **Prior Art:** Existing Vitest tests for `campaign-repo.ts` and `player-repo.ts` will serve as templates for setting up the test database and transaction rollbacks.

## Out of Scope

- Automatic extraction or parsing of rules from PDFs. Game Masters will need to input the rules manually or copy-paste them.
- Full roster or list-building logic (e.g., calculating total points of units selected, validating loadouts). This feature is strictly for storing and viewing the *rules* of the army, not the units themselves.
- Live State Tracking during a match (e.g., deducting CP or tracking Points). This is deferred to a future "game mode" dashboard feature.

## Further Notes

- The data model for rules must be extremely flexible. The Adepta Sororitas PDF example shows that rules can have complex triggers, costs, and nested conditions. The `metadata` JSON column will be critical for storing these varied attributes without requiring dozens of specific columns.
