import Knex from 'knex';
import config from './knexfile.js';

const knex = Knex(config.devpostgresql);

async function run() {
  const selections = await knex('game_selection');
  const links = await knex('game_entry_link');
  const groups = await knex('game_selection_group');

  const byId = new Map();
  const byParentId = new Map();

  const indexRows = (rows, table) => {
    for (const r of rows) {
      r._table = table;
      byId.set(r.id, r);
      if (r.parent_id) {
        if (!byParentId.has(r.parent_id)) byParentId.set(r.parent_id, []);
        byParentId.get(r.parent_id).push(r);
      }
    }
  };

  indexRows(selections, 'selection');
  indexRows(links, 'link');
  indexRows(groups, 'group');

  function printTree(nodeId, depth = 0) {
    const node = byId.get(nodeId);
    if (!node) return;
    
    let targetStr = '';
    if (node.target_id) {
        const target = byId.get(node.target_id);
        targetStr = target ? ` -> [${target._table}] ${target.name} (${target.id})` : ` -> UNRESOLVED (${node.target_id})`;
    }

    console.log(`${'  '.repeat(depth)}- [${node._table}] ${node.name} (${node.id})${targetStr}`);

    const children = byParentId.get(nodeId) || [];
    for (const child of children) {
        printTree(child.id, depth + 1);
    }
  }

  // Dump the Adeptus Custodes Crusade group tree
  console.log("Tree for dffe-91f2-f156-0566 (Adeptus Custodes Crusade):");
  printTree('dffe-91f2-f156-0566');
  
  process.exit(0);
}

run().catch(console.error);
