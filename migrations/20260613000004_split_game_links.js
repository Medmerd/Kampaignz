/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql') {
    await knex.raw('DROP TABLE IF EXISTS "game_link" CASCADE');
  } else {
    await knex.schema.dropTableIfExists('game_link');
  }

  if (!(await knex.schema.hasTable('game_category_link'))) {
    await knex.schema.createTable('game_category_link', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('source_id').notNullable();
      table.string('target_id').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_entry_link'))) {
    await knex.schema.createTable('game_entry_link', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('source_id').notNullable();
      table.string('target_id').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_info_link'))) {
    await knex.schema.createTable('game_info_link', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('source_id').notNullable();
      table.string('target_id').notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('game_info_link');
  await knex.schema.dropTableIfExists('game_entry_link');
  await knex.schema.dropTableIfExists('game_category_link');

  if (!(await knex.schema.hasTable('game_link'))) {
    await knex.schema.createTable('game_link', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('source_id').notNullable();
      table.string('target_id').notNullable();
      table.string('link_type').notNullable();
    });
  }
};
