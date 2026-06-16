import { Knex } from 'knex';
import { ParsedData } from './types';

export async function ingestData(knex: Knex, data: ParsedData) {
  await knex.transaction(async (trx) => {
    // 1. Determine Scope and Cleanup old records
    const isSystemImport = data.game_systems.length > 0;
    const isCatalogueImport = data.game_catalogues.length > 0;

    const tablesWithCatalogueScope = [
      'game_category', 'game_selection', 'game_selection_group', 'game_profile', 'game_characteristic',
      'game_category_link', 'game_entry_link', 'game_info_link',
      'game_profile_type', 'game_characteristic_type', 'game_rule', 'game_info_group',
      'game_publication', 'game_cost', 'game_constraint', 'game_force_entry',
      'game_catalogue_link', 'game_modifier', 'game_modifier_group', 'game_condition', 'game_condition_group'
    ];

    if (isSystemImport) {
      for (const gs of data.game_systems) {
        const sysId = gs.id;
        const rev = gs.revision;
        
        console.log(`Clearing old Game System records for ${sysId} (revision ${rev})`);
        
        // Delete records strictly belonging to the game system (catalogue_id is null)
        for (const table of tablesWithCatalogueScope) {
          await trx(table).where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
        }
        
        // Game system unique tables
        await trx('game_cost_type').where({ game_system_id: sysId, revision: rev }).delete();
        await trx('game_system').where({ id: sysId, revision: rev }).delete();
      }
    }

    if (isCatalogueImport) {
      for (const cat of data.game_catalogues) {
        const sysId = cat.game_system_id;
        const catId = cat.id;
        const rev = cat.revision;

        console.log(`Clearing old Catalogue records for ${catId} (system ${sysId}, revision ${rev})`);

        for (const table of tablesWithCatalogueScope) {
          await trx(table).where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
        }
        await trx('game_catalogue').where({ id: catId, game_system_id: sysId, revision: rev }).delete();
      }
    }

    // 2. Bulk Insert Data
    console.log('Inserting new records...');

    const collections = [
      { name: 'game_system', data: data.game_systems },
      { name: 'game_catalogue', data: data.game_catalogues },
      { name: 'game_cost_type', data: data.game_cost_types },
      { name: 'game_profile_type', data: data.game_profile_types },
      { name: 'game_characteristic_type', data: data.game_characteristic_types },
      { name: 'game_publication', data: data.game_publications },
      { name: 'game_category', data: data.game_categories },
      { name: 'game_info_group', data: data.game_info_groups },
      { name: 'game_rule', data: data.game_rules },
      { name: 'game_force_entry', data: data.game_force_entries },
      { name: 'game_selection', data: data.game_selections },
      { name: 'game_selection_group', data: data.game_selection_groups },
      { name: 'game_profile', data: data.game_profiles },
      { name: 'game_characteristic', data: data.game_characteristics },
      { name: 'game_category_link', data: data.game_category_links },
      { name: 'game_entry_link', data: data.game_entry_links },
      { name: 'game_info_link', data: data.game_info_links },
      { name: 'game_catalogue_link', data: data.game_catalogue_links },
      { name: 'game_cost', data: data.game_costs },
      { name: 'game_constraint', data: data.game_constraints },
      { name: 'game_modifier', data: data.game_modifiers },
      { name: 'game_modifier_group', data: data.game_modifier_groups },
      { name: 'game_condition', data: data.game_conditions },
      { name: 'game_condition_group', data: data.game_condition_groups },
    ];

    for (const collection of collections) {
      if (collection.data && collection.data.length > 0) {
        await trx(collection.name).insert(collection.data);
      }
    }

    console.log('Import transaction complete.');
  });
}
