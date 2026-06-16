const schema = 'kampaignz';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);
    return schemaBuilder.alterTable('players', (table) => {
        // Drop the old free-text column
        table.dropColumn('army');
        // Add the new foreign key
        table.integer('army_rule_id').nullable();
        table.foreign('army_rule_id').references('id').inTable('army_rules').onDelete('SET NULL');
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    const schemaBuilder = isSqlite ? knex.schema : knex.schema.withSchema(schema);
    return schemaBuilder.alterTable('players', (table) => {
        table.dropForeign('army_rule_id');
        table.dropColumn('army_rule_id');
        table.string('army').notNullable().defaultTo('Unknown');
    });
};
//# sourceMappingURL=20260609000002_add_army_rule_id_to_players.js.map