# 3. XML Parsing Rules

Date: 2026-06-14

## Status

Accepted

## Context

Kampaignz imports data from data files (`.gst` and `.cat`). These are complex XML files with highly nested and recursive structures. During the development of the XML parser, we encountered several significant challenges mapping the parsed XML output (via `fast-xml-parser`) into a relational SQLite database.

Specifically, XML allows objects like `<modifier>` and `<modifierGroup>` to nest indefinitely. Furthermore, the way `fast-xml-parser` constructs the Javascript object out of the XML has specific quirks:
1. **Arrays vs Objects**: When an XML tag occurs only once (e.g., a single `<modifier>`), `fast-xml-parser` parses it as an object. When it occurs multiple times, it parses it as an array. 
2. **Container Sibling Grouping**: Group tags (`<modifierGroup>`, `<conditionGroup>`, `<selectionEntryGroup>`) can appear as sibling tags alongside the primitive tags (`<modifier>`, `<condition>`, `<selectionEntry>`) inside wrapper tags (like `<modifiers>`).
3. **Implicit Node Structures**: If a parent tag contains both leaves and groups (e.g., `<modifiers>` containing `<modifier>` and `<modifierGroup>`), the resulting JavaScript object will have both `modifier` and `modifierGroups` as properties of the parent container.

## Decision

To properly parse and ingest XML data, we have adopted the following rules and patterns:

1. **`ensureArray` Wrapper**: Every time we access a potentially repeating XML tag, we MUST wrap it in our `ensureArray` helper function. This guarantees that whether `fast-xml-parser` parsed it as a single object or an array, our logic can iterate over it consistently.
2. **Distinct Group Tables**: We must split flat representations into distinct relational tables. For example, `game_selection` and `game_selection_group` are separate tables, just like `game_modifier` and `game_modifier_group`. This ensures `fast-xml-parser` group structures map directly 1:1 to the database.
3. **Container-Based Parsing Functions**: Parsing functions must accept the parent container that holds both the raw items and the groups. For instance, `parseModifierContainer(entry)` checks both `entry.modifiers.modifier` and `entry.modifiers.modifierGroups.modifierGroup`. Passing the nested `.modifiers` object directly leads to scope loss for nested groups because groups are siblings to items.
4. **Link Normalization**: Generic `<infoLinks>`, `<categoryLinks>`, and `<entryLinks>` must be split into specific relational link tables (`game_info_link`, `game_category_link`, `game_entry_link`) to enforce foreign key constraints effectively and prevent cascading delete issues when migrating schemas.
5. **Addressable vs. Value/Logic Nodes**:
   - **Addressable Nodes** (e.g., `<selectionEntry>`, `<profile>`, `<rule>`, `<selectionEntryGroup>`): These tags inherently possess a unique `id="..."` attribute. Because they have an ID, they can be defined globally and referenced externally via pointer links (like `<entryLink targetId="...">`).
   - **Value/Logic Nodes** (e.g., `<cost>`, `<characteristic>`, `<modifier>`, `<condition>`): These strictly nested structural tags **do not possess IDs** natively in the XML. Their relational existence is entirely dependent on structural nesting beneath a parent. Consequently, they can never be targeted by a pointer. To store them relationally in SQL, our parser must explicitly generate artificial UUIDs and assign `parent_id`s. When traversing the data tree programmatically, one must assume these nested nodes will be accessed based solely on the parent tag they are assigned to.

## Consequences

- The database schema is highly normalized, preventing data corruption and structure loss.
- The parser code is robust against unpredictable XML nesting patterns and XML arrays.
- Developers working on the parser must be extremely diligent about differentiating between a `modifier` and a `modifierGroup`, and must always remember to use `ensureArray`.
