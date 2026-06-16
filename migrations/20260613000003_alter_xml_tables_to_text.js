/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // game_system
  await knex.schema.alterTable('game_system', (table) => {
    table.text('name').alter();
  });

  // game_catalogue
  await knex.schema.alterTable('game_catalogue', (table) => {
    table.text('name').alter();
  });

  // game_category
  await knex.schema.alterTable('game_category', (table) => {
    table.text('name').alter();
  });

  // game_selection
  await knex.schema.alterTable('game_selection', (table) => {
    table.text('name').alter();
  });

  // game_profile
  await knex.schema.alterTable('game_profile', (table) => {
    table.text('type_name').alter();
    table.text('name').alter();
  });

  // game_characteristic
  await knex.schema.alterTable('game_characteristic', (table) => {
    table.text('name').alter();
  });

  // game_cost_type
  await knex.schema.alterTable('game_cost_type', (table) => {
    table.text('name').alter();
  });

  // game_profile_type
  await knex.schema.alterTable('game_profile_type', (table) => {
    table.text('name').alter();
  });

  // game_characteristic_type
  await knex.schema.alterTable('game_characteristic_type', (table) => {
    table.text('name').alter();
  });

  // game_rule
  await knex.schema.alterTable('game_rule', (table) => {
    table.text('name').alter();
  });

  // game_info_group
  await knex.schema.alterTable('game_info_group', (table) => {
    table.text('name').alter();
  });

  // game_publication
  await knex.schema.alterTable('game_publication', (table) => {
    table.text('name').alter();
    table.text('short_name').alter();
  });

  // game_cost
  await knex.schema.alterTable('game_cost', (table) => {
    table.text('name').alter();
  });

  // game_constraint
  await knex.schema.alterTable('game_constraint', (table) => {
    table.text('field').alter();
    table.text('value').alter();
  });

  // game_force_entry
  await knex.schema.alterTable('game_force_entry', (table) => {
    table.text('name').alter();
  });

  // game_catalogue_link
  await knex.schema.alterTable('game_catalogue_link', (table) => {
    table.text('name').alter();
  });

  // game_modifier
  await knex.schema.alterTable('game_modifier', (table) => {
    table.text('field').alter();
    table.text('value').alter();
  });

  // game_condition
  await knex.schema.alterTable('game_condition', (table) => {
    table.text('field').alter();
    table.text('value').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Reverting would involve altering back to string(255).
  // But we can safely leave them as text in a down migration 
  // or put them back to string if strictly required. 
  // For safety and data preservation, it's often better to leave it as text.
};
