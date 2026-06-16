/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (!(await knex.schema.hasTable('game_selection_group'))) {
    await knex.schema.createTable('game_selection_group', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.text('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_modifier_group'))) {
    await knex.schema.createTable('game_modifier_group', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('type').notNullable(); // typically "and" or "or"
    });
  }

  if (!(await knex.schema.hasTable('game_condition_group'))) {
    await knex.schema.createTable('game_condition_group', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('type').notNullable(); // typically "and" or "or"
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('game_condition_group');
  await knex.schema.dropTableIfExists('game_modifier_group');
  await knex.schema.dropTableIfExists('game_selection_group');
};
