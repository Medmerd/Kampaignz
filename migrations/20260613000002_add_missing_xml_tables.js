/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (!(await knex.schema.hasTable('game_cost_type'))) {
    await knex.schema.createTable('game_cost_type', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_profile_type'))) {
    await knex.schema.createTable('game_profile_type', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_characteristic_type'))) {
    await knex.schema.createTable('game_characteristic_type', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('profile_type_id').notNullable();
      table.string('name').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_rule'))) {
    await knex.schema.createTable('game_rule', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.string('name').notNullable();
      table.text('description').nullable();
      table.string('hidden').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_info_group'))) {
    await knex.schema.createTable('game_info_group', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.string('name').notNullable();
      table.string('hidden').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_publication'))) {
    await knex.schema.createTable('game_publication', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('name').notNullable();
      table.string('short_name').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_cost'))) {
    await knex.schema.createTable('game_cost', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('cost_type_id').notNullable();
      table.string('name').nullable();
      table.decimal('value', 10, 2).notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_constraint'))) {
    await knex.schema.createTable('game_constraint', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('type').notNullable();
      table.string('field').nullable();
      table.string('value').notNullable();
      table.string('percent_value').nullable();
      table.string('shared').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_force_entry'))) {
    await knex.schema.createTable('game_force_entry', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').nullable();
      table.string('name').notNullable();
      table.string('hidden').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_catalogue_link'))) {
    await knex.schema.createTable('game_catalogue_link', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('target_id').notNullable();
      table.string('type').notNullable();
      table.string('name').nullable();
    });
  }

  if (!(await knex.schema.hasTable('game_modifier'))) {
    await knex.schema.createTable('game_modifier', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('type').notNullable();
      table.string('field').notNullable();
      table.string('value').notNullable();
    });
  }

  if (!(await knex.schema.hasTable('game_condition'))) {
    await knex.schema.createTable('game_condition', (table) => {
      table.string('id').primary();
      table.string('game_system_id').notNullable();
      table.integer('revision').notNullable();
      table.string('catalogue_id').nullable();
      table.string('parent_id').notNullable();
      table.string('type').notNullable();
      table.string('child_id').nullable();
      table.string('field').notNullable();
      table.string('value').notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('game_condition');
  await knex.schema.dropTableIfExists('game_modifier');
  await knex.schema.dropTableIfExists('game_catalogue_link');
  await knex.schema.dropTableIfExists('game_force_entry');
  await knex.schema.dropTableIfExists('game_constraint');
  await knex.schema.dropTableIfExists('game_cost');
  await knex.schema.dropTableIfExists('game_publication');
  await knex.schema.dropTableIfExists('game_info_group');
  await knex.schema.dropTableIfExists('game_rule');
  await knex.schema.dropTableIfExists('game_characteristic_type');
  await knex.schema.dropTableIfExists('game_profile_type');
  await knex.schema.dropTableIfExists('game_cost_type');
};
