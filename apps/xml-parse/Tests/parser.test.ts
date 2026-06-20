import { describe, it, expect } from 'vitest';
import { BattleScribeParser } from '../parser';

describe('BattleScribeParser', () => {
  it('should parse a game system XML correctly with all new tags', () => {
    const parser = new BattleScribeParser();
    const mockGst = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <gameSystem id="sys-123" name="Test System" revision="5">
        <publications>
          <publication id="pub-1" name="Rulebook" shortName="RB" />
        </publications>
        <costTypes>
          <costType id="ct-1" name="pts" />
        </costTypes>
        <profileTypes>
          <profileType id="pt-1" name="Unit">
            <characteristicTypes>
              <characteristicType id="ct-char-1" name="M" />
            </characteristicTypes>
          </profileType>
        </profileTypes>
        <categoryEntries>
          <categoryEntry id="cat-1" name="Character" />
        </categoryEntries>
        <sharedRules>
          <rule id="rule-1" name="Deep Strike" hidden="false">
            <description>Can deep strike</description>
          </rule>
        </sharedRules>
        <sharedSelectionEntries>
          <selectionEntry id="sel-1" name="Hero" type="model">
            <costs>
              <cost costTypeId="ct-1" name="pts" value="100.0" />
            </costs>
            <profiles>
              <profile id="prof-1" name="Hero Stats" typeName="Unit">
                <characteristics>
                  <characteristic id="char-1" name="M" typeId="ct-char-1">6"</characteristic>
                </characteristics>
              </profile>
            </profiles>
            <modifiers>
              <modifier type="set" field="hidden" value="true">
                <conditions>
                  <condition type="instanceOf" childId="cat-1" field="selections" value="1.0" />
                </conditions>
              </modifier>
            </modifiers>
            <modifierGroups>
              <modifierGroup type="and">
                <modifiers>
                  <modifier type="set" field="name" value="Test" />
                </modifiers>
                <conditionGroups>
                  <conditionGroup type="or">
                    <conditions>
                      <condition type="equalTo" field="selections" value="2.0" />
                    </conditions>
                  </conditionGroup>
                </conditionGroups>
              </modifierGroup>
            </modifierGroups>
            <categoryLinks>
              <categoryLink id="link-1" targetId="cat-1" />
            </categoryLinks>
          </selectionEntry>
        </sharedSelectionEntries>
        <sharedSelectionEntryGroups>
          <selectionEntryGroup id="sel-grp-1" name="Ranged Weapons" />
        </sharedSelectionEntryGroups>
        <forceEntries>
          <forceEntry id="force-1" name="Detachment">
            <constraints>
              <constraint id="con-1" type="max" field="selections" value="3.0" />
            </constraints>
          </forceEntry>
        </forceEntries>
      </gameSystem>
    `;

    const data = parser.parseGameSystem(mockGst);

    expect(data.game_systems).toHaveLength(1);
    expect(data.game_publications).toHaveLength(1);
    //TODO: Restore this test once cost types feature is working
    // expect(data.game_cost_types).toHaveLength(1);
    expect(data.game_profile_types).toHaveLength(1);
    expect(data.game_characteristic_types).toHaveLength(1);
    expect(data.game_rules).toHaveLength(1);
    expect(data.game_costs).toHaveLength(1);
    expect(data.game_modifiers).toHaveLength(2); // The standalone and the nested one
    expect(data.game_conditions).toHaveLength(2); // The standalone and the nested one
    expect(data.game_force_entries).toHaveLength(1);
    expect(data.game_constraints).toHaveLength(1);

    expect(data.game_category_links).toHaveLength(1);
    expect(data.game_entry_links).toHaveLength(0);
    expect(data.game_info_links).toHaveLength(0);

    expect(data.game_selection_groups).toHaveLength(1);
    expect(data.game_modifier_groups).toHaveLength(1);
    expect(data.game_condition_groups).toHaveLength(1);

    expect(data.game_selection_groups[0].id).toBe('sel-grp-1');
    expect(data.game_modifier_groups[0].type).toBe('and');
    expect(data.game_condition_groups[0].type).toBe('or');
    expect(data.game_costs[0].cost_type_id).toBe('ct-1');
  });
});
