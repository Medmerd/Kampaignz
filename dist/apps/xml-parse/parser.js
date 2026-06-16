"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleScribeParser = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const parseOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attributesGroupName: 'group',
    allowBooleanAttributes: true,
};
const ensureArray = (obj) => {
    if (obj === undefined || obj === null)
        return [];
    return Array.isArray(obj) ? obj : [obj];
};
class BattleScribeParser {
    parser;
    data;
    currentSystemId = '';
    currentRevision = 0;
    currentCatalogueId = null;
    constructor() {
        this.parser = new fast_xml_parser_1.XMLParser(parseOptions);
        this.resetData();
    }
    resetData() {
        this.data = {
            game_systems: [],
            game_catalogues: [],
            game_categories: [],
            game_selections: [],
            game_profiles: [],
            game_characteristics: [],
            game_links: [],
        };
    }
    parseGameSystem(xmlString) {
        this.resetData();
        const jObj = this.parser.parse(xmlString);
        const gs = jObj.gameSystem;
        if (!gs || !gs.group)
            throw new Error('Invalid game system XML');
        const group = gs.group;
        this.currentSystemId = group.id;
        this.currentRevision = parseInt(group.revision, 10) || 1;
        this.currentCatalogueId = null;
        this.data.game_systems.push({
            id: this.currentSystemId,
            name: group.name,
            revision: this.currentRevision,
        });
        if (gs.categoryEntries && gs.categoryEntries.categoryEntry) {
            this.parseCategories(gs.categoryEntries.categoryEntry);
        }
        if (gs.sharedSelectionEntries && gs.sharedSelectionEntries.selectionEntry) {
            this.parseSelections(gs.sharedSelectionEntries.selectionEntry, null);
        }
        // Game System forceEntries could be handled here as well
        return this.data;
    }
    parseCatalogue(xmlString) {
        this.resetData();
        const jObj = this.parser.parse(xmlString);
        const cat = jObj.catalogue;
        if (!cat || !cat.group)
            throw new Error('Invalid catalogue XML');
        const group = cat.group;
        this.currentCatalogueId = group.id;
        this.currentSystemId = group.gameSystemId;
        this.currentRevision = parseInt(group.revision, 10) || 1;
        this.data.game_catalogues.push({
            id: this.currentCatalogueId,
            game_system_id: this.currentSystemId,
            revision: this.currentRevision,
            name: group.name,
        });
        if (cat.categoryEntries && cat.categoryEntries.categoryEntry) {
            this.parseCategories(cat.categoryEntries.categoryEntry);
        }
        if (cat.entryLinks && cat.entryLinks.entryLink) {
            this.parseLinks(cat.entryLinks.entryLink, this.currentCatalogueId, 'entry');
        }
        if (cat.sharedSelectionEntries && cat.sharedSelectionEntries.selectionEntry) {
            this.parseSelections(cat.sharedSelectionEntries.selectionEntry, null);
        }
        return this.data;
    }
    parseCategories(entries) {
        const cats = ensureArray(entries);
        for (const c of cats) {
            if (c.group && c.group.id) {
                this.data.game_categories.push({
                    id: c.group.id,
                    game_system_id: this.currentSystemId,
                    revision: this.currentRevision,
                    catalogue_id: this.currentCatalogueId,
                    name: c.group.name || '',
                });
            }
        }
    }
    parseLinks(links, sourceId, linkType) {
        const arr = ensureArray(links);
        for (const l of arr) {
            if (l.group && l.group.targetId) {
                this.data.game_links.push({
                    id: l.group.id || `${sourceId}-${l.group.targetId}`,
                    game_system_id: this.currentSystemId,
                    revision: this.currentRevision,
                    catalogue_id: this.currentCatalogueId,
                    source_id: sourceId,
                    target_id: l.group.targetId,
                    link_type: linkType,
                });
            }
        }
    }
    parseSelections(entries, parentId) {
        const arr = ensureArray(entries);
        for (const s of arr) {
            if (!s.group || !s.group.id)
                continue;
            const selId = s.group.id;
            this.data.game_selections.push({
                id: selId,
                game_system_id: this.currentSystemId,
                revision: this.currentRevision,
                catalogue_id: this.currentCatalogueId,
                parent_id: parentId,
                type: s.group.type || 'selectionEntry',
                name: s.group.name || '',
            });
            if (s.profiles && s.profiles.profile) {
                this.parseProfiles(s.profiles.profile, selId);
            }
            if (s.infoLinks && s.infoLinks.infoLink) {
                this.parseLinks(s.infoLinks.infoLink, selId, 'info');
            }
            if (s.categoryLinks && s.categoryLinks.categoryLink) {
                this.parseLinks(s.categoryLinks.categoryLink, selId, 'category');
            }
            if (s.entryLinks && s.entryLinks.entryLink) {
                this.parseLinks(s.entryLinks.entryLink, selId, 'entry');
            }
            if (s.selectionEntries && s.selectionEntries.selectionEntry) {
                this.parseSelections(s.selectionEntries.selectionEntry, selId);
            }
            if (s.selectionEntryGroups && s.selectionEntryGroups.selectionEntryGroup) {
                this.parseSelectionGroups(s.selectionEntryGroups.selectionEntryGroup, selId);
            }
        }
    }
    parseSelectionGroups(groups, parentId) {
        const arr = ensureArray(groups);
        for (const g of arr) {
            if (!g.group || !g.group.id)
                continue;
            const grpId = g.group.id;
            this.data.game_selections.push({
                id: grpId,
                game_system_id: this.currentSystemId,
                revision: this.currentRevision,
                catalogue_id: this.currentCatalogueId,
                parent_id: parentId,
                type: 'selectionEntryGroup',
                name: g.group.name || '',
            });
            if (g.selectionEntries && g.selectionEntries.selectionEntry) {
                this.parseSelections(g.selectionEntries.selectionEntry, grpId);
            }
            if (g.selectionEntryGroups && g.selectionEntryGroups.selectionEntryGroup) {
                this.parseSelectionGroups(g.selectionEntryGroups.selectionEntryGroup, grpId);
            }
            if (g.entryLinks && g.entryLinks.entryLink) {
                this.parseLinks(g.entryLinks.entryLink, grpId, 'entry');
            }
        }
    }
    parseProfiles(profiles, parentId) {
        const arr = ensureArray(profiles);
        for (const p of arr) {
            if (!p.group || !p.group.id)
                continue;
            const profId = p.group.id;
            this.data.game_profiles.push({
                id: profId,
                game_system_id: this.currentSystemId,
                revision: this.currentRevision,
                catalogue_id: this.currentCatalogueId,
                parent_id: parentId,
                type_name: p.group.typeName || '',
                name: p.group.name || '',
            });
            if (p.characteristics && p.characteristics.characteristic) {
                const chars = ensureArray(p.characteristics.characteristic);
                for (const c of chars) {
                    if (!c.group || !c.group.name)
                        continue;
                    this.data.game_characteristics.push({
                        id: c.group.id || `${profId}-${c.group.name}`,
                        game_system_id: this.currentSystemId,
                        revision: this.currentRevision,
                        catalogue_id: this.currentCatalogueId,
                        profile_id: profId,
                        name: c.group.name,
                        value: c['#text'] || null,
                    });
                }
            }
        }
    }
}
exports.BattleScribeParser = BattleScribeParser;
//# sourceMappingURL=parser.js.map