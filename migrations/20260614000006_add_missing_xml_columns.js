/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('game_entry_link', (table) => {
    table.text('name').nullable();
    table.boolean('hidden').nullable();
    table.boolean('collective').nullable();
    table.boolean('import').nullable();
    table.text('type').nullable();
  });

  await knex.schema.alterTable('game_category_link', (table) => {
    table.text('name').nullable();
    table.boolean('hidden').nullable();
    table.boolean('primary').nullable();
  });

  await knex.schema.alterTable('game_info_link', (table) => {
    table.text('name').nullable();
    table.boolean('hidden').nullable();
    table.text('type').nullable();
  });

  await knex.schema.alterTable('game_catalogue_link', (table) => {
    table.boolean('import_root_entries').nullable();
  });

  await knex.schema.alterTable('game_selection', (table) => {
    table.boolean('hidden').nullable();
    table.boolean('collective').nullable();
    table.boolean('import').nullable();
    table.text('sort_index').nullable();
    table.text('default_amount').nullable();
  });

  await knex.schema.alterTable('game_selection_group', (table) => {
    table.boolean('hidden').nullable();
    table.boolean('collective').nullable();
    table.boolean('import').nullable();
    table.text('default_selection_entry_id').nullable();
  });

  await knex.schema.alterTable('game_profile', (table) => {
    table.boolean('hidden').nullable();
  });

  await knex.schema.alterTable('game_condition', (table) => {
    table.text('scope').nullable();
    table.boolean('shared').nullable();
    table.boolean('include_child_selections').nullable();
    table.boolean('include_child_forces').nullable();
    table.text('child_name').nullable();
    table.text('percent_value').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // SQLite does not fully support dropping columns easily, 
  // but Knex can do it via a table rebuild or dropColumn if the dialect supports it.
  const isSqlite = knex.client.dialect === 'sqlite3';
  
  // NOTE: For sqlite, dropping multiple columns requires recreating the table. 
  // It is often safer/easier to leave them during rollbacks or accept that 
  // knex.schema.alterTable .dropColumn can be very slow or fail on some old sqlite versions.
  // We'll use dropColumn; Knex handles the table copy natively in modern versions.
  
  await knex.schema.alterTable('game_entry_link', (table) => {
    table.dropColumn('name');
    table.dropColumn('hidden');
    table.dropColumn('collective');
    table.dropColumn('import');
    table.dropColumn('type');
  });

  await knex.schema.alterTable('game_category_link', (table) => {
    table.dropColumn('name');
    table.dropColumn('hidden');
    table.dropColumn('primary');
  });

  await knex.schema.alterTable('game_info_link', (table) => {
    table.dropColumn('name');
    table.dropColumn('hidden');
    table.dropColumn('type');
  });

  await knex.schema.alterTable('game_catalogue_link', (table) => {
    table.dropColumn('import_root_entries');
  });

  await knex.schema.alterTable('game_selection', (table) => {
    table.dropColumn('hidden');
    table.dropColumn('collective');
    table.dropColumn('import');
    table.dropColumn('sort_index');
    table.dropColumn('default_amount');
  });

  await knex.schema.alterTable('game_selection_group', (table) => {
    table.dropColumn('hidden');
    table.dropColumn('collective');
    table.dropColumn('import');
    table.dropColumn('default_selection_entry_id');
  });

  await knex.schema.alterTable('game_profile', (table) => {
    table.dropColumn('hidden');
  });

  await knex.schema.alterTable('game_condition', (table) => {
    table.dropColumn('scope');
    table.dropColumn('shared');
    table.dropColumn('include_child_selections');
    table.dropColumn('include_child_forces');
    table.dropColumn('child_name');
    table.dropColumn('percent_value');
  });
};
