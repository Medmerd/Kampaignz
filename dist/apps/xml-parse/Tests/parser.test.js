"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const parser_1 = require("../parser");
(0, vitest_1.describe)('BattleScribeParser', () => {
    (0, vitest_1.it)('should parse a game system XML correctly', () => {
        const parser = new parser_1.BattleScribeParser();
        const mockGst = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <gameSystem id="sys-123" name="Test System" revision="5">
        <categoryEntries>
          <categoryEntry id="cat-1" name="Character" />
        </categoryEntries>
        <sharedSelectionEntries>
          <selectionEntry id="sel-1" name="Hero" type="model">
            <profiles>
              <profile id="prof-1" name="Hero Stats" typeName="Unit">
                <characteristics>
                  <characteristic id="char-1" name="M">6"</characteristic>
                </characteristics>
              </profile>
            </profiles>
            <categoryLinks>
              <categoryLink id="link-1" targetId="cat-1" />
            </categoryLinks>
          </selectionEntry>
        </sharedSelectionEntries>
      </gameSystem>
    `;
        const data = parser.parseGameSystem(mockGst);
        (0, vitest_1.expect)(data.game_systems).toHaveLength(1);
        (0, vitest_1.expect)(data.game_systems[0]).toEqual({
            id: 'sys-123',
            name: 'Test System',
            revision: 5
        });
        (0, vitest_1.expect)(data.game_categories).toHaveLength(1);
        (0, vitest_1.expect)(data.game_categories[0].id).toBe('cat-1');
        (0, vitest_1.expect)(data.game_selections).toHaveLength(1);
        (0, vitest_1.expect)(data.game_selections[0].id).toBe('sel-1');
        (0, vitest_1.expect)(data.game_selections[0].name).toBe('Hero');
        (0, vitest_1.expect)(data.game_selections[0].parent_id).toBeNull();
        (0, vitest_1.expect)(data.game_profiles).toHaveLength(1);
        (0, vitest_1.expect)(data.game_profiles[0].id).toBe('prof-1');
        (0, vitest_1.expect)(data.game_profiles[0].parent_id).toBe('sel-1');
        (0, vitest_1.expect)(data.game_characteristics).toHaveLength(1);
        (0, vitest_1.expect)(data.game_characteristics[0].name).toBe('M');
        (0, vitest_1.expect)(data.game_characteristics[0].value).toBe('6"');
        (0, vitest_1.expect)(data.game_characteristics[0].profile_id).toBe('prof-1');
        (0, vitest_1.expect)(data.game_links).toHaveLength(1);
        (0, vitest_1.expect)(data.game_links[0].target_id).toBe('cat-1');
        (0, vitest_1.expect)(data.game_links[0].source_id).toBe('sel-1');
    });
    (0, vitest_1.it)('should parse deeply nested selection entry groups', () => {
        const parser = new parser_1.BattleScribeParser();
        const mockCat = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <catalogue id="catg-1" name="Test Faction" gameSystemId="sys-123" revision="2">
        <sharedSelectionEntries>
          <selectionEntry id="sel-root" name="Root Entry">
            <selectionEntryGroups>
              <selectionEntryGroup id="grp-1" name="Group 1">
                <selectionEntries>
                  <selectionEntry id="sel-child" name="Child Entry" />
                </selectionEntries>
              </selectionEntryGroup>
            </selectionEntryGroups>
          </selectionEntry>
        </sharedSelectionEntries>
      </catalogue>
    `;
        const data = parser.parseCatalogue(mockCat);
        (0, vitest_1.expect)(data.game_catalogues).toHaveLength(1);
        (0, vitest_1.expect)(data.game_catalogues[0].id).toBe('catg-1');
        const selections = data.game_selections;
        (0, vitest_1.expect)(selections).toHaveLength(3); // sel-root, grp-1, sel-child
        const root = selections.find(s => s.id === 'sel-root');
        const grp = selections.find(s => s.id === 'grp-1');
        const child = selections.find(s => s.id === 'sel-child');
        (0, vitest_1.expect)(root?.parent_id).toBeNull();
        (0, vitest_1.expect)(grp?.parent_id).toBe('sel-root');
        (0, vitest_1.expect)(child?.parent_id).toBe('grp-1');
    });
});
//# sourceMappingURL=parser.test.js.map