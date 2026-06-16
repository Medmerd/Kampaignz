/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Core Entities
    .createTable('rulebook_unit', function(table) {
      table.string('id').primary();
      table.string('faction_id');
      table.string('name').notNullable();
      table.text('composition');
    })
    .createTable('rulebook_model', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
    })
    .createTable('rulebook_profile', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('type_name').notNullable();
    })
    .createTable('rulebook_characteristic', function(table) {
      table.string('id').primary();
      table.string('profile_id').notNullable();
      table.string('name').notNullable();
      table.text('value');
      table.foreign('profile_id').references('rulebook_profile.id').onDelete('CASCADE');
    })
    .createTable('rulebook_crusade', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('type');
      table.text('description');
    })
    .createTable('rulebook_detachment', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description');
    })
    
    // Join Tables
    .createTable('rulebook_unit_model', function(table) {
      table.increments('id').primary();
      table.string('unit_id').notNullable();
      table.string('model_id').notNullable();
      table.foreign('unit_id').references('rulebook_unit.id').onDelete('CASCADE');
      table.foreign('model_id').references('rulebook_model.id').onDelete('CASCADE');
    })
    .createTable('rulebook_model_profile', function(table) {
      table.increments('id').primary();
      table.string('model_id').notNullable();
      table.string('profile_id').notNullable();
      table.foreign('model_id').references('rulebook_model.id').onDelete('CASCADE');
      table.foreign('profile_id').references('rulebook_profile.id').onDelete('CASCADE');
    })
    .createTable('rulebook_unit_profile', function(table) {
      table.increments('id').primary();
      table.string('unit_id').notNullable();
      table.string('profile_id').notNullable();
      table.foreign('unit_id').references('rulebook_unit.id').onDelete('CASCADE');
      table.foreign('profile_id').references('rulebook_profile.id').onDelete('CASCADE');
    })
    .createTable('rulebook_detachment_profile', function(table) {
      table.increments('id').primary();
      table.string('detachment_id').notNullable();
      table.string('profile_id').notNullable();
      table.foreign('detachment_id').references('rulebook_detachment.id').onDelete('CASCADE');
      table.foreign('profile_id').references('rulebook_profile.id').onDelete('CASCADE');
    })
    .createTable('rulebook_entity_crusade', function(table) {
      table.increments('id').primary();
      table.string('entity_id').notNullable();
      table.string('crusade_id').notNullable();
      table.foreign('crusade_id').references('rulebook_crusade.id').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('rulebook_entity_crusade')
    .dropTableIfExists('rulebook_detachment_profile')
    .dropTableIfExists('rulebook_unit_profile')
    .dropTableIfExists('rulebook_model_profile')
    .dropTableIfExists('rulebook_unit_model')
    .dropTableIfExists('rulebook_detachment')
    .dropTableIfExists('rulebook_crusade')
    .dropTableIfExists('rulebook_characteristic')
    .dropTableIfExists('rulebook_profile')
    .dropTableIfExists('rulebook_model')
    .dropTableIfExists('rulebook_unit');
};
