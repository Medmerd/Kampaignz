/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (!(await knex.schema.hasTable('game_system'))) {
    await knex.schema.createTable('game_system', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.integer('revision').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_catalogue'))) {
    await knex.schema.createTable('game_catalogue', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_category'))) {
    await knex.schema.createTable('game_category', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_selection'))) {
    await knex.schema.createTable('game_selection', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.string('type').notNullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_profile'))) {
    await knex.schema.createTable('game_profile', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.string('type_name').notNullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_characteristic'))) {
    await knex.schema.createTable('game_characteristic', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('profile_id').notNullable();
      table.string('name').notNullable();
      table.text('value').nullable();
    });
  }

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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('game_link');
  await knex.schema.dropTableIfExists('game_characteristic');
  await knex.schema.dropTableIfExists('game_profile');
  await knex.schema.dropTableIfExists('game_selection');
  await knex.schema.dropTableIfExists('game_category');
  await knex.schema.dropTableIfExists('game_catalogue');
  await knex.schema.dropTableIfExists('game_system');
};
