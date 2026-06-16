const { writeFile } = require("fs/promises");
const knex = require("knex");
const knexConfig = require("../../knexfile");

const saveJson = async (data, fileName) => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await writeFile(fileName, jsonString, 'utf8');
        console.log('File successfully saved!:', fileName);
    } catch (error) {
        console.error('Error writing file:', error);
    }
}

const buildMaps = (dbData) => {
    const byId = new Map();
    const byParentId = new Map();
    const rootsByCatalogue = new Map();

    // Iterate over all tables fetched from the DB
    for (const [tableName, rows] of Object.entries(dbData)) {
        for (const row of rows) {
            // Attach the table name to identify what kind of node it is
            row._table = tableName;

            // Index by ID
            if (row.id) {
                byId.set(row.id, row);
            }

            // Index by parent_id
            if (row.parent_id) {
                if (!byParentId.has(row.parent_id)) {
                    byParentId.set(row.parent_id, []);
                }
                byParentId.get(row.parent_id).push(row);
            } else if (row.catalogue_id) {
                // If it has no parent, it's a root node for its catalogue
                if (!rootsByCatalogue.has(row.catalogue_id)) {
                    rootsByCatalogue.set(row.catalogue_id, []);
                }
                rootsByCatalogue.get(row.catalogue_id).push(row);
            }
        }
    }

    return { byId, byParentId, rootsByCatalogue };
};

const buildNodeTree = (node, maps, depth = 0) => {
    // Prevent infinite loops just in case of malformed cyclic data
    if (depth > 50) return { ...node, _error: 'Max depth exceeded' };

    const { byId, byParentId } = maps;
    const resolvedNode = { ...node };

    // Resolve pointer links
    if (resolvedNode.target_id) {
        const target = byId.get(resolvedNode.target_id);
        if (target) {
            // We recursively build the target so we get its children too
            resolvedNode._target = buildNodeTree(target, maps, depth + 1);
        } else {
            resolvedNode._target = null; // Target missing in DB
        }
    }

    // Resolve children
    if (resolvedNode.id) {
        const children = byParentId.get(resolvedNode.id) || [];
        if (children.length > 0) {
            resolvedNode.children = children.map(child => buildNodeTree(child, maps, depth + 1));
        }
    }

    return resolvedNode;
};

const main = async () => {
    try {
        console.log('Starting Script');

        const environment = process.env.VITE_DB_CLIENT || 'devpostgresql';
        const config = knexConfig[environment];
        console.log('Connecting to base:', config.connection.database);
        const db = knex(config);

        const gameSystem = await db('game_system').first();
        if (!gameSystem) throw new Error("No game system found.");
        
        const { id: gameSystemId } = gameSystem;
        console.log('Game System:', gameSystem.name);

        const tablesToFetch = [
            'game_selection', 'game_selection_group',
            'game_entry_link', 'game_info_link', 'game_category_link',
            'game_rule', 'game_profile', 'game_category', 
            'game_modifier', 'game_condition', 'game_modifier_group', 'game_condition_group',
            'game_force_entry'
        ];

        console.log('Fetching all records for system to build memory maps...');
        const dbData = {};
        for (const table of tablesToFetch) {
            dbData[table] = await db(table).where({ game_system_id: gameSystemId });
        }

        console.log('Building memory maps...');
        const maps = buildMaps(dbData);

        const gameCatalogue = await db('game_catalogue').where({ game_system_id: gameSystemId });
        
        console.log('Building tree...');
        for (const catalogue of gameCatalogue) {
            const { id, name } = catalogue;
            console.log(`Processing catalogue: ${name}`);
            
            const rootNodes = maps.rootsByCatalogue.get(id) || [];
            const resolvedRoots = rootNodes.map(root => buildNodeTree(root, maps));

            gameSystem[name.replaceAll(' - ', '-').replaceAll(' ', '_')] = { 
                id, 
                name, 
                roots: resolvedRoots 
            };
        }

        await saveJson(gameSystem, './apps/xml-parse/out/rule-tree.json');

        console.log('Completed Script');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

main();