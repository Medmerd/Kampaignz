"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration009CreateArmyRules = void 0;
exports.migration009CreateArmyRules = {
    id: '009_create_army_rules',
    up: (db) => {
        db.exec(`
      CREATE TABLE IF NOT EXISTS army_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        original_campaign_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_army_rules_original_campaign_id
        ON army_rules(original_campaign_id);

      CREATE TABLE IF NOT EXISTS army_rule_shares (
        campaign_id INTEGER NOT NULL,
        army_rule_id INTEGER NOT NULL,
        PRIMARY KEY (campaign_id, army_rule_id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (army_rule_id) REFERENCES army_rules(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_army_rule_shares_campaign_id
        ON army_rule_shares(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_army_rule_shares_army_rule_id
        ON army_rule_shares(army_rule_id);
    `);
    },
};
//# sourceMappingURL=009_create_army_rules.js.map