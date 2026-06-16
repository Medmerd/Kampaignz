const schema = 'kampaignz';
const createSchema = (knex) => {
    const isSqlite = knex.client.config.client === 'sqlite3' || knex.client.config.client === 'better-sqlite3';
    return isSqlite ? knex.schema : knex.schema.withSchema(schema);
};
exports.up = async function (knex) {
    const schemaBuilder = createSchema(knex);
    return schemaBuilder
        .createTable('army_rules', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description').notNullable().defaultTo('');
        table.integer('original_campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
        table.timestamps(true, true); // creates created_at and updated_at
    })
        .createTable('army_rule_shares', (table) => {
        table.integer('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
        table.integer('army_rule_id').notNullable().references('id').inTable('army_rules').onDelete('CASCADE');
        table.primary(['campaign_id', 'army_rule_id']);
    });
};
exports.down = function (knex) {
    const schemaBuilder = createSchema(knex);
    return schemaBuilder
        .dropTableIfExists('army_rule_shares')
        .dropTableIfExists('army_rules');
};
//# sourceMappingURL=20260609000000_create_army_rules.js.map