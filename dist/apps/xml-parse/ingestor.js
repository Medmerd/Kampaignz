"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestData = void 0;
async function ingestData(knex, data) {
    await knex.transaction(async (trx) => {
        // 1. Determine Scope and Cleanup old records
        const isSystemImport = data.game_systems.length > 0;
        const isCatalogueImport = data.game_catalogues.length > 0;
        if (isSystemImport) {
            for (const gs of data.game_systems) {
                const sysId = gs.id;
                const rev = gs.revision;
                console.log(`Clearing old Game System records for ${sysId} (revision ${rev})`);
                // Delete records strictly belonging to the game system (catalogue_id is null)
                await trx('game_category').where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
                await trx('game_selection').where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
                await trx('game_profile').where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
                await trx('game_characteristic').where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
                await trx('game_link').where({ game_system_id: sysId, revision: rev }).whereNull('catalogue_id').delete();
                await trx('game_system').where({ id: sysId, revision: rev }).delete();
            }
        }
        if (isCatalogueImport) {
            for (const cat of data.game_catalogues) {
                const sysId = cat.game_system_id;
                const catId = cat.id;
                const rev = cat.revision;
                console.log(`Clearing old Catalogue records for ${catId} (system ${sysId}, revision ${rev})`);
                await trx('game_category').where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
                await trx('game_selection').where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
                await trx('game_profile').where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
                await trx('game_characteristic').where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
                await trx('game_link').where({ game_system_id: sysId, catalogue_id: catId, revision: rev }).delete();
                await trx('game_catalogue').where({ id: catId, game_system_id: sysId, revision: rev }).delete();
            }
        }
        // 2. Bulk Insert Data
        console.log('Inserting new records...');
        if (data.game_systems.length > 0) {
            await trx('game_system').insert(data.game_systems);
        }
        if (data.game_catalogues.length > 0) {
            await trx('game_catalogue').insert(data.game_catalogues);
        }
        if (data.game_categories.length > 0) {
            await trx('game_category').insert(data.game_categories);
        }
        if (data.game_selections.length > 0) {
            await trx('game_selection').insert(data.game_selections);
        }
        if (data.game_profiles.length > 0) {
            await trx('game_profile').insert(data.game_profiles);
        }
        if (data.game_characteristics.length > 0) {
            await trx('game_characteristic').insert(data.game_characteristics);
        }
        if (data.game_links.length > 0) {
            await trx('game_link').insert(data.game_links);
        }
        console.log('Import transaction complete.');
    });
}
exports.ingestData = ingestData;
//# sourceMappingURL=ingestor.js.map