const schema = 'kampaignz';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);
    return schemaBuilder
        .createTable('player_rules', (table) => {
        table.increments('id').primary();
        table.integer('player_id').notNullable().index('idx_player_rules_player_id');
        table.integer('rule_id').notNullable().index('idx_player_rules_rule_id');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.foreign('player_id').references('id').inTable('players').onDelete('CASCADE');
        table.foreign('rule_id').references('id').inTable('rules').onDelete('CASCADE');
    })
        .then(() => console.log("Table player_rules created successfully!"))
        .catch(err => {
        console.error("Error creating player_rules:", err);
        throw err;
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);
    await schemaBuilder.dropTableIfExists('player_rules');
    return knex.schema;
};
//# sourceMappingURL=20260610000001_create_player_rules.js.map