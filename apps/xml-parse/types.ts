


export type CategoryEntry = {
    comment: string,
    group: {
        name: string,
        id: string,
        hidden: boolean,
    }
};

export interface CampaignEntry {
    [key: string]: string;
}

export interface FactonEntry {
    [key: string]: string;
}

export interface GameSystem {
    id: string;
    name: string;
    revision: number;
}

export interface GameCatalogue {
    id: string;
    game_system_id: string;
    revision: number;
    name: string;
}

export interface GameCategory {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    name: string;
}

export interface GameSelection {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    type: string;
    name: string;
    hidden: boolean | null;
    collective: boolean | null;
    import: boolean | null;
    sort_index: string | null;
    default_amount: string | null;
}

export interface GameSelectionGroup {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    name: string;
    hidden: boolean | null;
    collective: boolean | null;
    import: boolean | null;
    default_selection_entry_id: string | null;
}

export interface GameProfile {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    type_name: string;
    name: string;
    hidden: boolean | null;
}

export interface GameCharacteristic {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    profile_id: string;
    type_id: string;
    name: string;
    value: string | null;
}

export interface GameCategoryLink {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    source_id: string;
    target_id: string;
    name: string | null;
    hidden: boolean | null;
    primary: boolean | null;
}

export interface GameEntryLink {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    source_id: string;
    target_id: string;
    name: string | null;
    hidden: boolean | null;
    collective: boolean | null;
    import: boolean | null;
    type: string | null;
}

export interface GameInfoLink {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    source_id: string;
    target_id: string;
    name: string | null;
    hidden: boolean | null;
    type: string | null;
}

export interface GameCostType {
    id: string;
    game_system_id: string;
    revision: number;
    name: string;
}

export interface GameProfileType {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    name: string;
}

export interface GameCharacteristicType {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    profile_type_id: string;
    name: string;
}

export interface GameRule {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    name: string;
    description: string | null;
    hidden: string | null;
}

export interface GameInfoGroup {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    name: string;
    hidden: string | null;
}

export interface GamePublication {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    name: string;
    short_name: string | null;
}

export interface GameCost {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    cost_type_id: string;
    name: string | null;
    value: number;
}

export interface GameConstraint {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    type: string;
    field: string | null;
    value: string;
    percent_value: string | null;
    shared: string | null;
}

export interface GameForceEntry {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string | null;
    name: string;
    hidden: string | null;
}

export interface GameCatalogueLink {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    target_id: string;
    type: string;
    name: string | null;
    import_root_entries: boolean | null;
}

export interface GameModifier {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    type: string;
    field: string;
    value: string;
}

export interface GameModifierGroup {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    type: string;
}

export interface GameCondition {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    type: string;
    child_id: string | null;
    field: string;
    value: string;
    scope: string | null;
    shared: boolean | null;
    include_child_selections: boolean | null;
    include_child_forces: boolean | null;
    child_name: string | null;
    percent_value: string | null;
}

export interface GameConditionGroup {
    id: string;
    game_system_id: string;
    revision: number;
    catalogue_id: string | null;
    parent_id: string;
    type: string;
}

export interface ParsedData {
    game_systems: GameSystem[];
    game_catalogues: GameCatalogue[];
    game_categories: GameCategory[];
    game_selections: GameSelection[];
    game_selection_groups: GameSelectionGroup[];
    game_profiles: GameProfile[];
    game_characteristics: GameCharacteristic[];
    game_category_links: GameCategoryLink[];
    game_entry_links: GameEntryLink[];
    game_info_links: GameInfoLink[];
    game_cost_types: GameCostType[];
    game_profile_types: GameProfileType[];
    game_characteristic_types: GameCharacteristicType[];
    game_rules: GameRule[];
    game_info_groups: GameInfoGroup[];
    game_publications: GamePublication[];
    game_costs: GameCost[];
    game_constraints: GameConstraint[];
    game_force_entries: GameForceEntry[];
    game_catalogue_links: GameCatalogueLink[];
    game_modifiers: GameModifier[];
    game_modifier_groups: GameModifierGroup[];
    game_conditions: GameCondition[];
    game_condition_groups: GameConditionGroup[];
}