import { Knex } from 'knex';
import crypto from 'crypto';

/**
 * Generates a SHA-256 hash for deduplication
 */
export function generateHash(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Interface representing a node in our memory map
 */
interface Node {
    id: string;
    parent_id?: string | null;
    profile_id?: string | null;
    target_id?: string;
    catalogue_id: string;
    type?: string;
    type_name?: string;
    name?: string;
    value?: string;
    field?: string;
    _table: string;
    children?: Node[];
    _target?: Node | null;
}

/**
 * Extracts rulebook units and models from the generic game tables
 */
export async function extractRulebookUnits(db: Knex): Promise<void> {
    console.log('Extracting Rulebook Units and Models...');

    // 1. Fetch tables required for traversal
    const selections = await db('game_selection');
    const links = await db('game_entry_link');
    const groups = await db('game_selection_group');
    const profiles = await db('game_profile');
    const characteristics = await db('game_characteristic');
    const infoLinks = await db('game_info_link');
    const constraints = await db('game_constraint');

    // 2. Build Memory Maps
    const byId = new Map<string, Node>();
    const byParentId = new Map<string, Node[]>();

    const indexRows = (rows: any[], tableName: string, parentField = 'parent_id') => {
        for (const row of rows) {
            row._table = tableName;
            if (row.id) byId.set(row.id, row);
            const pId = row[parentField];
            if (pId) {
                if (!byParentId.has(pId)) byParentId.set(pId, []);
                byParentId.get(pId)!.push(row);
            }
        }
    };

    indexRows(selections, 'game_selection');
    indexRows(links, 'game_entry_link');
    indexRows(groups, 'game_selection_group');
    indexRows(profiles, 'game_profile');
    indexRows(characteristics, 'game_characteristic', 'profile_id');
    indexRows(infoLinks, 'game_info_link');
    indexRows(constraints, 'game_constraint');

    // Recursive finder
    const findModels = (nodeId: string, depth = 0, foundModels = new Map<string, Node>()): Map<string, Node> => {
        if (depth > 20) return foundModels; 
        const children = byParentId.get(nodeId) || [];
        for (const child of children) {
            let target = child;
            if (child.target_id) target = byId.get(child.target_id) || child;

            if (target.type === 'model' || child.type === 'model') foundModels.set(target.id, target);

            findModels(child.id, depth + 1, foundModels);
            if (child.target_id && target.id !== child.id) findModels(target.id, depth + 1, foundModels);
        }
        return foundModels;
    };

    const findProfiles = (nodeId: string, stopAtModels: boolean, depth = 0, foundProfiles = new Map<string, Node>()): Map<string, Node> => {
        if (depth > 20) return foundProfiles;
        const children = byParentId.get(nodeId) || [];
        
        for (const child of children) {
            let target = child;
            if (child.target_id) target = byId.get(child.target_id) || child;

            // Collect Profile
            if (target._table === 'game_profile') {
                foundProfiles.set(target.id, target);
            } else if (target._table === 'game_selection' && target.type === 'tracker') {
                const syntheticProfile: Node = {
                    ...target,
                    _table: 'synthetic_profile',
                    type_name: 'Tracker',
                };
                foundProfiles.set(syntheticProfile.id, syntheticProfile);
            }

            // Stop traversal if we hit a model and we are asked to stop
            if (stopAtModels && (target.type === 'model' || child.type === 'model')) {
                continue;
            }

            findProfiles(child.id, stopAtModels, depth + 1, foundProfiles);
            if (child.target_id && target.id !== child.id) findProfiles(target.id, stopAtModels, depth + 1, foundProfiles);
        }
        return foundProfiles;
    };

    const findCrusades = (nodeId: string, depth = 0, found = new Map<string, Node>()): Map<string, Node> => {
        if (depth > 20) return found;
        const children = byParentId.get(nodeId) || [];
        for (const child of children) {
            let target = child;
            if (child.target_id) target = byId.get(child.target_id) || child;

            if (target._table === 'game_selection_group' && target.name === 'Crusade') {
                found.set(target.id, target);
            }

            findCrusades(child.id, depth + 1, found);
            if (child.target_id && target.id !== child.id) findCrusades(target.id, depth + 1, found);
        }
        return found;
    };

    // Helper to extract and insert a profile and its characteristics
    const processProfile = async (profileNode: Node, entityId: string, entityType: 'unit' | 'model' | 'detachment' | 'crusade') => {
        // Collect characteristics
        const chars = byParentId.get(profileNode.id) || [];
        const charMap: Record<string, string> = {};
        
        if (profileNode._table === 'synthetic_profile' && profileNode.type_name === 'Tracker') {
            for (const child of chars) {
                if (child._table === 'game_constraint') {
                    const key = `${child.type || 'constraint'}_${child.field || 'unknown'}`;
                    charMap[key] = child.value || '-';
                }
            }
        } else {
            for (const char of chars) {
                if (char.name) charMap[char.name] = char.value || '-';
            }
        }

        // Sort keys to ensure deterministic hash
        const sortedChars: Record<string, string> = {};
        Object.keys(charMap).sort().forEach(k => { sortedChars[k] = charMap[k]; });

        const profileContent = {
            name: profileNode.name || 'Unknown',
            type_name: profileNode.type_name || 'Unknown',
            characteristics: sortedChars
        };

        const profileHash = generateHash(profileContent);

        // Insert Profile if unique
        const existingProfile = await db('rulebook_profile').where({ id: profileHash }).first();
        if (!existingProfile) {
            await db('rulebook_profile').insert({
                id: profileHash,
                name: profileContent.name,
                type_name: profileContent.type_name
            });

            // Insert characteristics
            for (const [charName, charValue] of Object.entries(sortedChars)) {
                // Char ID can be a composite hash of profileHash + charName to keep it unique and deterministic
                const charId = generateHash({ profileHash, charName });
                await db('rulebook_characteristic').insert({
                    id: charId,
                    profile_id: profileHash,
                    name: charName,
                    value: charValue
                });
            }
        }

        // Link profile to entity
        if (entityType === 'unit') {
            const existing = await db('rulebook_unit_profile').where({ unit_id: entityId, profile_id: profileHash }).first();
            if (!existing) {
                await db('rulebook_unit_profile').insert({ unit_id: entityId, profile_id: profileHash });
            }
        } else if (entityType === 'model') {
            const existing = await db('rulebook_model_profile').where({ model_id: entityId, profile_id: profileHash }).first();
            if (!existing) {
                await db('rulebook_model_profile').insert({ model_id: entityId, profile_id: profileHash });
            }
        } else if (entityType === 'detachment') {
            const existing = await db('rulebook_detachment_profile').where({ detachment_id: entityId, profile_id: profileHash }).first();
            if (!existing) {
                await db('rulebook_detachment_profile').insert({ detachment_id: entityId, profile_id: profileHash });
            }
        } else if (entityType === 'crusade') {
            const existing = await db('rulebook_crusade_profile').where({ crusade_id: entityId, profile_id: profileHash }).first();
            if (!existing) {
                await db('rulebook_crusade_profile').insert({ crusade_id: entityId, profile_id: profileHash });
            }
        }
    };

    // 3. Find Units
    const unitNodes: Node[] = [];
    for (const node of byId.values()) {
        const isExplicitUnit = node.type === 'unit';
        // A model acts as a standalone unit if it is exposed at the root (no parent)
        const isRootModel = node.type === 'model' && !node.parent_id;

        if ((isExplicitUnit || isRootModel) && (node._table === 'game_selection' || node._table === 'game_entry_link')) {
            // Resolve target if it's a link
            const target = node.target_id ? byId.get(node.target_id) || node : node;
            if (target.name) {
                if (!unitNodes.some(u => u.id === target.id)) {
                    unitNodes.push(target);
                }
            }
        }
    }

    console.log(`Found ${unitNodes.length} unit nodes.`);

    // 4. Insert Units and Models
    let insertedUnits = 0;
    let insertedModels = 0;

    for (const unit of unitNodes) {
        // Insert Unit
        await db('rulebook_unit').insert({
            id: unit.id,
            faction_id: unit.catalogue_id || '',
            name: unit.name || 'Unknown Unit',
            composition: ''
        }).onConflict('id').ignore();
        insertedUnits++;

        // Find and process Unit-level Profiles
        const unitProfiles = findProfiles(unit.id, true);
        for (const profile of unitProfiles.values()) {
            await processProfile(profile, unit.id, 'unit');
        }

        // Link Crusades
        const unitCrusades = findCrusades(unit.id);
        for (const crusade of unitCrusades.values()) {
            const existing = await db('rulebook_entity_crusade').where({ entity_id: unit.id, crusade_id: crusade.id }).first();
            if (!existing) await db('rulebook_entity_crusade').insert({ entity_id: unit.id, crusade_id: crusade.id });
        }

        // Find Models recursively
        const models = findModels(unit.id);
        
        // If the unit itself IS a model (like Shield-Captain), ensure it's in the models list
        if (unit.type === 'model') {
            models.set(unit.id, unit);
        }
        
        for (const model of models.values()) {
            if (!model.name) continue;

            await db('rulebook_model').insert({
                id: model.id,
                name: model.name
            }).onConflict('id').ignore();
            insertedModels++;

            // Link them
            const existingLink = await db('rulebook_unit_model')
                .where({ unit_id: unit.id, model_id: model.id })
                .first();

            if (!existingLink) {
                await db('rulebook_unit_model').insert({
                    unit_id: unit.id,
                    model_id: model.id
                });
            }

                // Find and process Model-level Profiles
                const modelProfiles = findProfiles(model.id, false);
                for (const profile of modelProfiles.values()) {
                    await processProfile(profile, model.id, 'model');
                }
            }
        }

    // 4. Extract Detachments
    let insertedDetachments = 0;
    const detachmentGroups: Node[] = [];
    for (const node of byId.values()) {
        if (node._table === 'game_selection_group' && (node.name === 'Detachment' || node.name === 'Detachments')) {
            detachmentGroups.push(node);
        }
    }

    for (const group of detachmentGroups) {
        await db('rulebook_detachment').insert({
            id: group.id,
            name: group.name || 'Unknown Detachment',
            description: ''
        }).onConflict('id').ignore();
        insertedDetachments++;

        const detachmentProfiles = findProfiles(group.id, false);
        for (const profile of detachmentProfiles.values()) {
            await processProfile(profile, group.id, 'detachment');
        }

        // Link Crusades
        const detachmentCrusades = findCrusades(group.id);
        for (const crusade of detachmentCrusades.values()) {
            const existing = await db('rulebook_entity_crusade').where({ entity_id: group.id, crusade_id: crusade.id }).first();
            if (!existing) await db('rulebook_entity_crusade').insert({ entity_id: group.id, crusade_id: crusade.id });
        }
    }

    // 5. Extract Crusades
    let insertedCrusades = 0;
    const crusadeGroups: Node[] = [];
    for (const node of byId.values()) {
        if (node._table === 'game_selection_group' && node.name === 'Crusade') {
            crusadeGroups.push(node);
        }
    }

    for (const group of crusadeGroups) {
        await db('rulebook_crusade').insert({
            id: group.id,
            name: group.name || 'Unknown Crusade',
            type: 'Global',
            description: ''
        }).onConflict('id').ignore();
        insertedCrusades++;

        // For Crusade, we extract its profiles.
        // We will pass 'crusade' as entityType which currently skips linking, as they are global profiles.
        const crusadeProfiles = findProfiles(group.id, false);
        for (const profile of crusadeProfiles.values()) {
            await processProfile(profile, group.id, 'crusade');
        }
    }

    console.log(`Extraction complete.`);
    console.log(`Inserted ${insertedUnits} units, ${insertedModels} models.`);
    console.log(`Inserted ${insertedDetachments} detachments, ${insertedCrusades} crusades.`);
}
