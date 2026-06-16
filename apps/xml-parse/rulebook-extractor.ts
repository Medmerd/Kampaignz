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
    parent_id: string | null;
    target_id?: string;
    catalogue_id: string;
    type?: string;
    name?: string;
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

    // 2. Build Memory Maps
    const byId = new Map<string, Node>();
    const byParentId = new Map<string, Node[]>();

    const indexRows = (rows: any[], tableName: string) => {
        for (const row of rows) {
            row._table = tableName;
            if (row.id) byId.set(row.id, row);
            if (row.parent_id) {
                if (!byParentId.has(row.parent_id)) byParentId.set(row.parent_id, []);
                byParentId.get(row.parent_id)!.push(row);
            }
        }
    };

    indexRows(selections, 'game_selection');
    indexRows(links, 'game_entry_link');
    indexRows(groups, 'game_selection_group');

    // Recursive finder
    const findModels = (nodeId: string, depth = 0, foundModels = new Map<string, Node>()): Map<string, Node> => {
        if (depth > 20) return foundModels; // Prevent infinite loops
        
        const children = byParentId.get(nodeId) || [];
        
        for (const child of children) {
            // If the child is a link, resolve its target
            let target = child;
            if (child.target_id) {
                target = byId.get(child.target_id) || child;
            }

            if (target.type === 'model' || child.type === 'model') {
                foundModels.set(target.id, target);
            }

            // Recursively search children of this child (or its resolved target)
            findModels(child.id, depth + 1, foundModels);
            if (child.target_id && target.id !== child.id) {
                findModels(target.id, depth + 1, foundModels);
            }
        }
        
        return foundModels;
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
        }
    }

    console.log(`Extracted ${insertedUnits} Units and ${insertedModels} Models (including duplicates filtered by DB).`);
}
