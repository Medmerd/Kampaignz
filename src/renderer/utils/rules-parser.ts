import { v4 as uuidv4 } from 'uuid';

export type ParsedRuleCapture = {
  id: string; // Temporary ID for UI tracking
  startIndex: number;
  endIndex: number;
  rule_category: string;
  name: string;
  description: string;
  metadata?: string;
};

export const parseArmyRulesFromText = (text: string): ParsedRuleCapture[] => {
  const captures: ParsedRuleCapture[] = [];

  // 1. STRATAGEMS Heuristic
  // Looks for ALL CAPS NAMES followed by 1CP or 2CP or 3CP.
  // We use [\s\S] to match across newlines.
  const stratagemRegex = /([A-Z\s\-']{4,})\s+([1-3]CP)\s+([\s\S]*?)(?=(?:[A-Z\s\-']{4,}\s+[1-3]CP)|\bENHANCEMENTS\b|\bDETACHMENT RULE\b|$)/g;
  
  let match;
  while ((match = stratagemRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const endIndex = stratagemRegex.lastIndex;
    
    const rawName = match[1].trim();
    const cpCost = match[2].trim();
    const description = match[3].trim();
    
    // Clean up the name (sometimes it grabs preceding boilerplate like 'STRATAGEMS' or 'EPIC DEED STRATAGEM')
    // We will just keep the last line of the captured name if it spans multiple lines.
    const nameLines = rawName.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const finalName = nameLines[nameLines.length - 1];

    // If it's literally just the section header, skip
    if (finalName === 'STRATAGEMS') continue;

    const metadata = JSON.stringify({ cost: cpCost });

    captures.push({
      id: uuidv4(),
      startIndex,
      endIndex,
      rule_category: 'Stratagem',
      name: finalName,
      description,
      metadata
    });
  }

  // 2. ENHANCEMENTS Heuristic
  // This one is trickier. Usually there's an "ENHANCEMENTS" heading, then names, often with point costs like "10 pts" or "15 pts".
  const enhancementRegex = /([A-Z\s\-']{4,})\s+(\d+\s*pts)\s+([\s\S]*?)(?=(?:[A-Z\s\-']{4,}\s+\d+\s*pts)|\bDETACHMENT RULE\b|\bSTRATAGEMS\b|$)/g;
  
  while ((match = enhancementRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const endIndex = enhancementRegex.lastIndex;
    
    const rawName = match[1].trim();
    const points = match[2].trim();
    const description = match[3].trim();
    
    const nameLines = rawName.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const finalName = nameLines[nameLines.length - 1];

    if (finalName === 'ENHANCEMENTS') continue;

    const metadata = JSON.stringify({ cost: points });

    captures.push({
      id: uuidv4(),
      startIndex,
      endIndex,
      rule_category: 'Enhancement',
      name: finalName,
      description,
      metadata
    });
  }

  // Sort captures by their appearance in the document
  captures.sort((a, b) => a.startIndex - b.startIndex);

  return captures;
};
