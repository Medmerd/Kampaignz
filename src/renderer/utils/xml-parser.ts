import { XMLParser } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';

export type XMLRuleCapture = {
  id: string; // Temporary ID for UI tracking
  rule_category: string;
  name: string;
  description: string;
  metadata?: string;
  selected?: boolean; // Used by UI
};

export const parseBattlescribeXML = async (file: File): Promise<XMLRuleCapture[]> => {
  const text = await file.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });
  
  const jsonObj = parser.parse(text);
  const captures: XMLRuleCapture[] = [];

  // Helper to recursively find all nodes with a specific key
  const findNodes = (obj: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, keyName: string): any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] => {
     let results: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] = [];
     if (!obj || typeof obj !== 'object') return results;

     for (const key of Object.keys(obj)) {
         if (key === keyName) {
             if (Array.isArray(obj[key])) {
                 results = results.concat(obj[key]);
             } else {
                 results.push(obj[key]);
             }
         }
         
         if (typeof obj[key] === 'object') {
             if (Array.isArray(obj[key])) {
                 for (const item of obj[key]) {
                     results = results.concat(findNodes(item, keyName));
                 }
             } else {
                 results = results.concat(findNodes(obj[key], keyName));
             }
         }
     }
     return results;
  };

  const getRuleDescription = (ruleNode: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): string => {
      if (!ruleNode) return '';
      if (typeof ruleNode.description === 'string') return ruleNode.description;
      if (ruleNode.description && ruleNode.description['#text']) return ruleNode.description['#text'];
      return '';
  };

  const getProfileDescription = (profileNode: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): string => {
      const chars = findNodes(profileNode, 'characteristic');
      const descChar = chars.find(c => c['@_name'] === 'Description' || c['@_name'] === 'Effect' || c['@_name'] === 'Rules');
      if (!descChar) return '';
      if (typeof descChar === 'string') return descChar;
      if (descChar['#text']) return descChar['#text'];
      return '';
  };

  // 1. Grab Detachments and nested rules
  const selectionEntryGroups = findNodes(jsonObj, 'selectionEntryGroup');
  const detachments = selectionEntryGroups.filter(g => g['@_name'] === 'Detachment');

  for (const detachmentGroup of detachments) {
      const entries = findNodes(detachmentGroup, 'selectionEntry');
      for (const entry of entries) {
          if (entry['@_type'] === 'upgrade' || entry['@_type'] === 'selectionEntry') {
             const detachmentName = entry['@_name'];
             const rules = findNodes(entry, 'rule');
             for (const rule of rules) {
                 captures.push({
                     id: uuidv4(),
                     rule_category: 'Detachment',
                     name: `${detachmentName} - ${rule['@_name'] || 'Rule'}`,
                     description: getRuleDescription(rule),
                     selected: true
                 });
             }
          }
      }
  }

  // 2. Grab all Profiles that are Enhancements or Stratagems
  const allProfiles = findNodes(jsonObj, 'profile');
  for (const profile of allProfiles) {
      const typeName = profile['@_typeName'];
      if (typeName === 'Enhancement' || typeName === 'Stratagem') {
          if (!captures.find(c => c.name === profile['@_name'])) {
              captures.push({
                  id: uuidv4(),
                  rule_category: typeName,
                  name: profile['@_name'],
                  description: getProfileDescription(profile),
                  selected: true
              });
          }
      }
  }

  // 3. Grab all global rules as generic "Army Rules"
  // Note: This might grab unit-specific rules like "Deep Strike", but the user can uncheck them in the UI.
  const allRules = findNodes(jsonObj, 'rule');
  for (const rule of allRules) {
      const ruleName = rule['@_name'] || 'Unknown Rule';
      if (!captures.find(c => c.name === ruleName || c.name.endsWith(ruleName))) {
          // Try to skip extremely common generic rules to reduce noise
          if (['Deep Strike', 'Leader', 'Feel No Pain', 'Scouts', 'Invulnerable Save', 'Deadly Demise', 'Firing Deck'].includes(ruleName)) {
              continue;
          }
          captures.push({
             id: uuidv4(),
             rule_category: 'Army Rule',
             name: ruleName,
             description: getRuleDescription(rule),
             selected: false // Default these to false because there will be a lot of noise
          });
      }
  }

  return captures;
};
