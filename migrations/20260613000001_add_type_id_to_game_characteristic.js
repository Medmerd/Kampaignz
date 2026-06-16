/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('game_characteristic', (table) => {
    table.string('type_id').notNullable().defaultTo('');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('game_characteristic', (table) => {
    table.dropColumn('type_id');
  });
};
