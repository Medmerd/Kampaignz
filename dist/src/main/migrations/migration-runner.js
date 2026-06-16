"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const index_1 = require("./index");
const runMigrations = (db) => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    const appliedRows = db
        .prepare('SELECT id FROM schema_migrations')
        .all();
    const applied = new Set(appliedRows.map((row) => row.id));
    for (const migration of index_1.migrations) {
        if (applied.has(migration.id)) {
            continue;
        }
        const transaction = db.transaction(() => {
            migration.up(db);
            db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(migration.id);
        });
        transaction();
    }
};
exports.runMigrations = runMigrations;
//# sourceMappingURL=migration-runner.js.map