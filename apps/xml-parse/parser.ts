import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import {
  ParsedData,
  GameSystem, GameCatalogue, GameCategory, GameSelection, GameProfile, GameCharacteristic,
  GameLink, GameCostType, GameProfileType, GameCharacteristicType, GameRule, GameInfoGroup,
  GamePublication, GameCost, GameConstraint, GameForceEntry, GameCatalogueLink, GameModifier,
  GameCondition
} from './types';

const parseOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  attributesGroupName: 'group',
  allowBooleanAttributes: true,
};

const ensureArray = (obj: any) => {
  if (obj === undefined || obj === null) return [];
  return Array.isArray(obj) ? obj : [obj];
};

function recordsAreIdentical(a: any, b: any): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export class BattleScribeParser {
  private parser: XMLParser;
  private data: ParsedData;
  private currentSystemId: string = '';
  private currentRevision: number = 0;
  private currentCatalogueId: string | null = null;
  private seenIds: Map<string, any> = new Map();

  constructor() {
    this.parser = new XMLParser(parseOptions);
    this.resetData();
  }

  private resetData() {
    this.seenIds.clear();
    this.data = {
      game_systems: [], game_catalogues: [], game_categories: [], game_selections: [], game_selection_groups: [],
      game_profiles: [], game_characteristics: [],
      game_category_links: [], game_entry_links: [], game_info_links: [],
      game_cost_types: [], game_profile_types: [], game_characteristic_types: [],
      game_rules: [], game_info_groups: [], game_publications: [], game_costs: [],
      game_constraints: [], game_force_entries: [], game_catalogue_links: [],
      game_modifiers: [], game_modifier_groups: [], game_conditions: [], game_condition_groups: []
    };
  }

  public parseGameSystem(xmlString: string): ParsedData {
    this.resetData();
    const jObj = this.parser.parse(xmlString);
    const gs = jObj.gameSystem;
    if (!gs || !gs.group) throw new Error('Invalid game system XML');

    const group = gs.group;
    this.currentSystemId = group.id;
    this.currentRevision = parseInt(group.revision, 10) || 1;
    this.currentCatalogueId = null;

    const newSys = {
      id: this.currentSystemId,
      name: group.name,
      revision: this.currentRevision,
    };
    this.addRecord('game_systems', newSys);

    this.parseRootElements(gs);
    return this.data;
  }

  public parseCatalogue(xmlString: string): ParsedData {
    this.resetData();
    const jObj = this.parser.parse(xmlString);
    const cat = jObj.catalogue;
    if (!cat || !cat.group) throw new Error('Invalid catalogue XML');

    const group = cat.group;
    this.currentCatalogueId = group.id;
    this.currentSystemId = group.gameSystemId;
    this.currentRevision = parseInt(group.revision, 10) || 1;

    const newCat = {
      id: this.currentCatalogueId,
      game_system_id: this.currentSystemId,
      revision: this.currentRevision,
      name: group.name,
    };
    this.addRecord('game_catalogues', newCat);

    this.parseRootElements(cat);

    if (cat.catalogueLinks && cat.catalogueLinks.catalogueLink) {
      const links = ensureArray(cat.catalogueLinks.catalogueLink);
      for (const l of links) {
        if (!l.group || !l.group.targetId) continue;
        this.addRecord('game_catalogue_links', {
          id: l.group.id || randomUUID(),
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          target_id: l.group.targetId,
          type: l.group.type || 'catalogue',
          name: l.group.name || null,
          import_root_entries: l.group.importRootEntries === 'true' || l.group.importRootEntries === true,
        });
      }
    }

    return this.data;
  }

  private addRecord(collection: keyof ParsedData, record: any) {
    if (record.id) {
      if (this.seenIds.has(record.id)) {
        const existing = this.seenIds.get(record.id);
        if (recordsAreIdentical(existing, record)) {
          return; // Exact duplicate, safely skip
        } else {
          console.log('Duplicate ID found with different data:', collection, JSON.stringify(existing), JSON.stringify(record));
          return; // Log the duplciate record
          // throw new Error(`Duplicate ID found with different data: ${record.id}`);
        }
      }
      this.seenIds.set(record.id, record);
    }
    (this.data[collection] as any[]).push(record);
  }

  private parseRootElements(root: any) {
    if (root.publications && root.publications.publication) {
      const pubs = ensureArray(root.publications.publication);
      for (const p of pubs) {
        if (p.group && p.group.id) {
          this.addRecord('game_publications', {
            id: p.group.id,
            game_system_id: this.currentSystemId,
            revision: this.currentRevision,
            catalogue_id: this.currentCatalogueId,
            name: p.group.name || '',
            short_name: p.group.shortName || null,
          });
        }
      }
    }

    if (root.costTypes && root.costTypes.costType) {
      const costs = ensureArray(root.costTypes.costType);

      for (const c of costs) {
        if (c.group && c.group.id) {
          // TODO: Fix this later. Currently it fails due to duplicate data.
          // this.addRecord('game_cost_types', {
          //   id: c.group.id,
          //   game_system_id: this.currentSystemId,
          //   revision: this.currentRevision,
          //   name: c.group.name || '',
          // });
        }
      }
    }

    if (root.profileTypes && root.profileTypes.profileType) {
      const profs = ensureArray(root.profileTypes.profileType);
      for (const p of profs) {
        if (!p.group || !p.group.id) continue;
        const ptId = p.group.id;
        this.addRecord('game_profile_types', {
          id: ptId,
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          name: p.group.name || '',
        });

        if (p.characteristicTypes && p.characteristicTypes.characteristicType) {
          const chars = ensureArray(p.characteristicTypes.characteristicType);
          for (const c of chars) {
            if (c.group && c.group.id) {
              this.addRecord('game_characteristic_types', {
                id: c.group.id,
                game_system_id: this.currentSystemId,
                revision: this.currentRevision,
                catalogue_id: this.currentCatalogueId,
                profile_type_id: ptId,
                name: c.group.name || '',
              });
            }
          }
        }
      }
    }

    if (root.categoryEntries && root.categoryEntries.categoryEntry) {
      this.parseCategories(root.categoryEntries.categoryEntry);
    }

    if (root.sharedSelectionEntries && root.sharedSelectionEntries.selectionEntry) {
      this.parseSelections(root.sharedSelectionEntries.selectionEntry, null);
    }
    if (root.sharedSelectionEntryGroups && root.sharedSelectionEntryGroups.selectionEntryGroup) {
      this.parseSelectionGroups(root.sharedSelectionEntryGroups.selectionEntryGroup, null);
    }
    if (root.sharedRules && root.sharedRules.rule) {
      this.parseRules(root.sharedRules.rule, null);
    }
    if (root.rules && root.rules.rule) {
      this.parseRules(root.rules.rule, null);
    }
    if (root.sharedProfiles && root.sharedProfiles.profile) {
      this.parseProfiles(root.sharedProfiles.profile, null);
    }
    if (root.sharedInfoGroups && root.sharedInfoGroups.infoGroup) {
      this.parseInfoGroups(root.sharedInfoGroups.infoGroup, null);
    }
    if (root.forceEntries && root.forceEntries.forceEntry) {
      this.parseForceEntries(root.forceEntries.forceEntry, null);
    }

    if (root.entryLinks && root.entryLinks.entryLink) {
      this.parseEntryLinks(root.entryLinks.entryLink, this.currentCatalogueId || this.currentSystemId);
    }
  }

  private parseCategories(entries: any) {
    const cats = ensureArray(entries);
    for (const c of cats) {
      if (c.group && c.group.id) {
        this.addRecord('game_categories', {
          id: c.group.id,
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          name: c.group.name || '',
        });
      }
    }
  }

  private parseCategoryLinks(links: any, sourceId: string) {
    const arr = ensureArray(links);
    for (const l of arr) {
      if (l.group && l.group.targetId && l.group.id) {
        this.addRecord('game_category_links', {
          id: l.group.id,
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          source_id: sourceId,
          target_id: l.group.targetId,
          name: l.group.name || null,
          hidden: l.group.hidden === 'true' || l.group.hidden === true,
          primary: l.group.primary === 'true' || l.group.primary === true,
        });
      }
    }
  }

  private parseEntryLinks(links: any, sourceId: string) {
    const arr = ensureArray(links);
    for (const l of arr) {
      if (l.group && l.group.targetId && l.group.id) {
        this.addRecord('game_entry_links', {
          id: l.group.id,
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          source_id: sourceId,
          target_id: l.group.targetId,
          name: l.group.name || null,
          hidden: l.group.hidden === 'true' || l.group.hidden === true,
          collective: l.group.collective === 'true' || l.group.collective === true,
          import: l.group.import === 'true' || l.group.import === true,
          type: l.group.type || null,
        });
      }
    }
  }

  private parseInfoLinks(links: any, sourceId: string) {
    const arr = ensureArray(links);
    for (const l of arr) {
      if (l.group && l.group.targetId && l.group.id) {
        this.addRecord('game_info_links', {
          id: l.group.id,
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          source_id: sourceId,
          target_id: l.group.targetId,
          name: l.group.name || null,
          hidden: l.group.hidden === 'true' || l.group.hidden === true,
          type: l.group.type || null,
        });
      }
    }
  }

  private parseCosts(costs: any, parentId: string) {
    const arr = ensureArray(costs);
    for (const c of arr) {
      if (c.group && c.group.costTypeId) {
        this.addRecord('game_costs', {
          id: c.group.id || randomUUID(),
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          parent_id: parentId,
          cost_type_id: c.group.costTypeId,
          name: c.group.name || null,
          value: parseFloat(c.group.value) || 0,
        });
      }
    }
  }

  private parseConstraints(constraints: any, parentId: string) {
    const arr = ensureArray(constraints);
    for (const c of arr) {
      if (c.group) {
        this.addRecord('game_constraints', {
          id: c.group.id || randomUUID(),
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          parent_id: parentId,
          type: c.group.type || '',
          field: c.group.field || null,
          value: c.group.value || '',
          percent_value: c.group.percentValue || null,
          shared: c.group.shared || null,
        });
      }
    }
  }

  private parseModifierContainer(entry: any, parentId: string) {
    if (!entry) return;
    if (entry.modifiers && entry.modifiers.modifier) {
      this.parseModifiers(entry.modifiers.modifier, parentId);
    }
    if (entry.modifierGroups && entry.modifierGroups.modifierGroup) {
      this.parseModifierGroups(entry.modifierGroups.modifierGroup, parentId);
    }
  }

  private parseConditionContainer(entry: any, parentId: string) {
    if (!entry) return;
    if (entry.conditions && entry.conditions.condition) {
      this.parseConditions(entry.conditions.condition, parentId);
    }
    if (entry.conditionGroups && entry.conditionGroups.conditionGroup) {
      this.parseConditionGroups(entry.conditionGroups.conditionGroup, parentId);
    }
  }

  private parseModifiers(modifiers: any, parentId: string) {
    const arr = ensureArray(modifiers);
    for (const m of arr) {
      if (!m.group) continue;
      const modId = m.group.id || randomUUID();
      this.addRecord('game_modifiers', {
        id: modId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        type: m.group.type || '',
        field: m.group.field || '',
        value: m.group.value || '',
      });

      this.parseConditionContainer(m, modId);
    }
  }

  private parseModifierGroups(groups: any, parentId: string) {
    const arr = ensureArray(groups);
    for (const g of arr) {
      if (!g.group) continue;
      const grpId = g.group.id || randomUUID();
      this.addRecord('game_modifier_groups', {
        id: grpId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        type: g.group.type || '',
      });

      this.parseModifierContainer(g, grpId);
      this.parseConditionContainer(g, grpId);
    }
  }

  private parseConditions(conditions: any, parentId: string) {
    const arr = ensureArray(conditions);
    for (const c of arr) {
      if (c.group) {
        this.addRecord('game_conditions', {
          id: c.group.id || randomUUID(),
          game_system_id: this.currentSystemId,
          revision: this.currentRevision,
          catalogue_id: this.currentCatalogueId,
          parent_id: parentId,
          type: c.group.type || '',
          child_id: c.group.childId || null,
          field: c.group.field || '',
          value: c.group.value || '',
          scope: c.group.scope || null,
          shared: c.group.shared === 'true' || c.group.shared === true,
          include_child_selections: c.group.includeChildSelections === 'true' || c.group.includeChildSelections === true,
          include_child_forces: c.group.includeChildForces === 'true' || c.group.includeChildForces === true,
          child_name: c.group.childName || null,
          percent_value: c.group.percentValue || null,
        });
      }
    }
  }

  private parseConditionGroups(groups: any, parentId: string) {
    const arr = ensureArray(groups);
    for (const g of arr) {
      if (!g.group) continue;
      const grpId = g.group.id || randomUUID();
      this.addRecord('game_condition_groups', {
        id: grpId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        type: g.group.type || '',
      });

      this.parseConditionContainer(g, grpId);
    }
  }

  private parseRules(rules: any, parentId: string | null) {
    const arr = ensureArray(rules);
    for (const r of arr) {
      if (!r.group || !r.group.id) continue;
      const ruleId = r.group.id;
      this.addRecord('game_rules', {
        id: ruleId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        name: r.group.name || '',
        description: r.description || null,
        hidden: r.group.hidden || null,
      });
      this.parseModifierContainer(r, ruleId);
    }
  }

  private parseInfoGroups(groups: any, parentId: string | null) {
    const arr = ensureArray(groups);
    for (const g of arr) {
      if (!g.group || !g.group.id) continue;
      const grpId = g.group.id;
      this.addRecord('game_info_groups', {
        id: grpId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        name: g.group.name || '',
        hidden: g.group.hidden || null,
      });

      if (g.rules && g.rules.rule) this.parseRules(g.rules.rule, grpId);
      if (g.profiles && g.profiles.profile) this.parseProfiles(g.profiles.profile, grpId);
      if (g.infoGroups && g.infoGroups.infoGroup) this.parseInfoGroups(g.infoGroups.infoGroup, grpId);
      if (g.infoLinks && g.infoLinks.infoLink) this.parseInfoLinks(g.infoLinks.infoLink, grpId);
    }
  }

  private parseForceEntries(entries: any, parentId: string | null) {
    const arr = ensureArray(entries);
    for (const f of arr) {
      if (!f.group || !f.group.id) continue;
      const forceId = f.group.id;
      this.addRecord('game_force_entries', {
        id: forceId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        name: f.group.name || '',
        hidden: f.group.hidden || null,
      });

      if (f.categoryLinks && f.categoryLinks.categoryLink) {
        this.parseCategoryLinks(f.categoryLinks.categoryLink, forceId);
      }
      if (f.forceEntries && f.forceEntries.forceEntry) {
        this.parseForceEntries(f.forceEntries.forceEntry, forceId);
      }
      if (f.constraints && f.constraints.constraint) {
        this.parseConstraints(f.constraints.constraint, forceId);
      }
      this.parseModifierContainer(f, forceId);
      if (f.rules && f.rules.rule) {
        this.parseRules(f.rules.rule, forceId);
      }
    }
  }

  private parseProfiles(profiles: any, parentId: string | null) {
    const arr = ensureArray(profiles);
    for (const p of arr) {
      if (!p.group || !p.group.id) continue;

      const profId = p.group.id;
      this.addRecord('game_profiles', {
        id: profId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        type_name: p.group.typeName || '',
        name: p.group.name || '',
        hidden: p.group.hidden === 'true' || p.group.hidden === true,
      });

      if (p.characteristics && p.characteristics.characteristic) {
        const chars = ensureArray(p.characteristics.characteristic);
        for (const c of chars) {
          if (!c.group || !c.group.name || !c.group.id) continue;

          this.addRecord('game_characteristics', {
            id: c.group.id,
            game_system_id: this.currentSystemId,
            revision: this.currentRevision,
            catalogue_id: this.currentCatalogueId,
            profile_id: profId,
            type_id: c.group.typeId,
            name: c.group.name,
            value: c['#text'] || null,
          });
        }
      }
      this.parseModifierContainer(p, profId);
    }
  }

  private parseSelections(entries: any, parentId: string | null) {
    const arr = ensureArray(entries);
    for (const s of arr) {
      if (!s.group || !s.group.id) continue;

      const selId = s.group.id;
      this.addRecord('game_selections', {
        id: selId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        type: s.group.type || 'selectionEntry',
        name: s.group.name || '',
        hidden: s.group.hidden === 'true' || s.group.hidden === true,
        collective: s.group.collective === 'true' || s.group.collective === true,
        import: s.group.import === 'true' || s.group.import === true,
        sort_index: s.group.sortIndex || null,
        default_amount: s.group.defaultAmount || null,
      });

      this.parseCommonSelectionElements(s, selId);

      if (s.selectionEntries && s.selectionEntries.selectionEntry) {
        this.parseSelections(s.selectionEntries.selectionEntry, selId);
      }
      if (s.selectionEntryGroups && s.selectionEntryGroups.selectionEntryGroup) {
        this.parseSelectionGroups(s.selectionEntryGroups.selectionEntryGroup, selId);
      }
    }
  }

  private parseSelectionGroups(groups: any, parentId: string | null) {
    const arr = ensureArray(groups);
    for (const g of arr) {
      if (!g.group || !g.group.id) continue;

      const grpId = g.group.id;
      this.addRecord('game_selection_groups', {
        id: grpId,
        game_system_id: this.currentSystemId,
        revision: this.currentRevision,
        catalogue_id: this.currentCatalogueId,
        parent_id: parentId,
        name: g.group.name || '',
        hidden: g.group.hidden === 'true' || g.group.hidden === true,
        collective: g.group.collective === 'true' || g.group.collective === true,
        import: g.group.import === 'true' || g.group.import === true,
        default_selection_entry_id: g.group.defaultSelectionEntryId || null,
      });

      this.parseCommonSelectionElements(g, grpId);

      if (g.selectionEntries && g.selectionEntries.selectionEntry) {
        this.parseSelections(g.selectionEntries.selectionEntry, grpId);
      }
      if (g.selectionEntryGroups && g.selectionEntryGroups.selectionEntryGroup) {
        this.parseSelectionGroups(g.selectionEntryGroups.selectionEntryGroup, grpId);
      }
    }
  }

  private parseCommonSelectionElements(entry: any, parentId: string) {
    if (entry.profiles && entry.profiles.profile) this.parseProfiles(entry.profiles.profile, parentId);
    if (entry.rules && entry.rules.rule) this.parseRules(entry.rules.rule, parentId);
    if (entry.infoGroups && entry.infoGroups.infoGroup) this.parseInfoGroups(entry.infoGroups.infoGroup, parentId);
    if (entry.infoLinks && entry.infoLinks.infoLink) this.parseInfoLinks(entry.infoLinks.infoLink, parentId);
    if (entry.categoryLinks && entry.categoryLinks.categoryLink) this.parseCategoryLinks(entry.categoryLinks.categoryLink, parentId);
    if (entry.entryLinks && entry.entryLinks.entryLink) this.parseEntryLinks(entry.entryLinks.entryLink, parentId);
    if (entry.costs && entry.costs.cost) this.parseCosts(entry.costs.cost, parentId);
    this.parseModifierContainer(entry, parentId);
    if (entry.constraints && entry.constraints.constraint) this.parseConstraints(entry.constraints.constraint, parentId);
  }
}
