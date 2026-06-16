exports.up = function (knex) {
    return knex.schema.createTable('rules', (table) => {
        table.increments('id').primary();
        // Foreign Keys - nullable as a rule can be attached to any ONE of these
        table.integer('army_rule_id').nullable().references('id').inTable('army_rules').onDelete('CASCADE');
        table.integer('campaign_id').nullable().references('id').inTable('campaigns').onDelete('CASCADE');
        table.integer('mission_id').nullable().references('id').inTable('missions').onDelete('CASCADE');
        // Core attributes
        table.string('rule_category').notNullable();
        table.string('name').notNullable();
        table.text('description').notNullable().defaultTo('');
        table.json('metadata').nullable(); // JSON blob for complex limits/costs
        // Hierarchy
        table.integer('parent_rule_id').nullable().references('id').inTable('rules').onDelete('CASCADE');
        table.timestamps(true, true);
        // Indexes to improve retrieval speed
        table.index('army_rule_id');
        table.index('campaign_id');
        table.index('mission_id');
        table.index('parent_rule_id');
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('rules');
};
//# sourceMappingURL=20260609000001_create_rules.js.map