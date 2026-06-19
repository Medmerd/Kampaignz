const fs = require('fs');
const glob = require('glob'); // Need to check if glob is installed, if not, use fs.readdirSync recursively
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src/renderer/screens/campaign-details');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix catch (err) -> catch (err: any)
    if (content.includes('catch (err)')) {
        content = content.replace(/catch\s*\(\s*err\s*\)/g, 'catch (err: any)');
        changed = true;
    }

    if (file.endsWith('armyRuleModal.tsx')) {
        content = content.replace(/rulebooks\.map\(\s*rulebook\s*=>/g, 'rulebooks.map((rulebook: any) =>');
        changed = true;
    }

    if (file.endsWith('armyRulesTab.tsx')) {
        if (!content.includes('import type { TabOptions, ArmyRulebook }')) {
            content = content.replace(/import React/, "import type { TabOptions, ArmyRulebook } from '../../types';\nimport React");
            changed = true;
        }
    }

    if (file.endsWith('messageModal.tsx')) {
        content = content.replace(/players\.map\(\s*player\s*=>/g, 'players.map((player: any) =>');
        changed = true;
    }

    if (file.endsWith('messageTab.tsx')) {
        content = content.replace(/useState<Message>\(null\)/g, 'useState<Message | null>(null)');
        content = content.replace(/setEditingMessage\(null\)/g, 'setEditingMessage(null)'); // will be valid now
        changed = true;
    }

    if (file.endsWith('missionModal.tsx')) {
        content = content.replace(/missions\.map\(\s*m\s*=>/g, 'missions.map((m: any) =>');
        content = content.replace(/player\.army\?/g, 'player.army_rule_name?');
        changed = true;
    }

    if (file.endsWith('playerModal.tsx')) {
        content = content.replace(/rulebooks\.map\(\s*rb\s*=>/g, 'rulebooks.map((rb: any) =>');
        content = content.replace(/players\.map\(\s*p\s*=>/g, 'players.map((p: any) =>');
        changed = true;
    }

    if (file.endsWith('playerTab.tsx')) {
        content = content.replace(/players\.map\(\s*p\s*=>/g, 'players.map((p: any) =>');
        changed = true;
    }

    if (file.endsWith('RuleModal.tsx')) {
        content = content.replace(/rules\.map\(\s*rule\s*=>/g, 'rules.map((rule: any) =>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
