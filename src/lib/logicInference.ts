export interface Rule {
  id: number;
  condition: Record<string, string>;
  conclusion: Record<string, string>;
  raw: string;
}

export interface Fact {
  variable: string;
  value: string;
}

export interface InferenceResult {
  conclusion: Record<string, string>;
  trace: string[];
  success: boolean;
}

export function parseRules(rulesText: string): Rule[] {
  const rules: Rule[] = [];
  const lines = rulesText.split('\n').filter(line => line.trim());
  
  lines.forEach((line, index) => {
    const match = line.match(/IF\s+(.+?)\s+THEN\s+(.+)/i);
    if (match) {
      const conditionParts = match[1].split(/\s+AND\s+/i);
      const condition: Record<string, string> = {};
      
      conditionParts.forEach(part => {
        const [variable, value] = part.split('=').map(s => s.trim());
        if (variable && value) {
          condition[variable] = value;
        }
      });
      
      const conclusionPart = match[2].trim();
      const [variable, value] = conclusionPart.split('=').map(s => s.trim());
      const conclusion: Record<string, string> = {};
      if (variable && value) {
        conclusion[variable] = value;
      }
      
      rules.push({
        id: index + 1,
        condition,
        conclusion,
        raw: line.trim()
      });
    }
  });
  
  return rules;
}

export function parseFacts(factsText: string): Record<string, string> {
  const facts: Record<string, string> = {};
  const lines = factsText.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const [variable, value] = line.split('=').map(s => s.trim());
    if (variable && value) {
      facts[variable] = value;
    }
  });
  
  return facts;
}

function checkCondition(condition: Record<string, string>, facts: Record<string, string>): boolean {
  return Object.entries(condition).every(([variable, value]) => facts[variable] === value);
}

export function forwardChaining(rules: Rule[], initialFacts: Record<string, string>): InferenceResult {
  const facts = { ...initialFacts };
  const trace: string[] = [`Initial facts: ${JSON.stringify(facts)}`];
  let changed = true;
  let iterations = 0;
  const maxIterations = 100;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    for (const rule of rules) {
      if (checkCondition(rule.condition, facts)) {
        const newFacts = Object.entries(rule.conclusion).filter(
          ([variable, value]) => facts[variable] !== value
        );
        
        if (newFacts.length > 0) {
          newFacts.forEach(([variable, value]) => {
            facts[variable] = value;
          });
          trace.push(`Rule ${rule.id} fired: ${rule.raw} → ${JSON.stringify(rule.conclusion)}`);
          changed = true;
        }
      }
    }
  }
  
  return {
    conclusion: facts,
    trace,
    success: true
  };
}

export function backwardChaining(
  rules: Rule[],
  initialFacts: Record<string, string>,
  goal: { variable: string; value?: string }
): InferenceResult {
  const facts = { ...initialFacts };
  const trace: string[] = [`Goal: Prove ${goal.variable}${goal.value ? ` = ${goal.value}` : ''}`];
  const visited = new Set<string>();
  
  function prove(variable: string, targetValue?: string): boolean {
    const key = `${variable}=${targetValue || '*'}`;
    if (visited.has(key)) return false;
    visited.add(key);
    
    // Check if already known
    if (variable in facts) {
      if (!targetValue || facts[variable] === targetValue) {
        trace.push(`✓ ${variable} = ${facts[variable]} (already known)`);
        return true;
      }
      trace.push(`✗ ${variable} = ${facts[variable]} ≠ ${targetValue}`);
      return false;
    }
    
    // Find rules that can derive this variable
    for (const rule of rules) {
      const conclusion = rule.conclusion;
      if (variable in conclusion) {
        if (targetValue && conclusion[variable] !== targetValue) continue;
        
        trace.push(`Trying rule ${rule.id}: ${rule.raw}`);
        
        // Try to prove all conditions
        const allConditionsProven = Object.entries(rule.condition).every(([condVar, condValue]) =>
          prove(condVar, condValue)
        );
        
        if (allConditionsProven) {
          Object.entries(conclusion).forEach(([v, val]) => {
            facts[v] = val;
          });
          trace.push(`✓ Rule ${rule.id} succeeded → ${variable} = ${conclusion[variable]}`);
          return true;
        } else {
          trace.push(`✗ Rule ${rule.id} failed (conditions not met)`);
        }
      }
    }
    
    trace.push(`✗ Cannot prove ${variable}${targetValue ? ` = ${targetValue}` : ''}`);
    return false;
  }
  
  const success = prove(goal.variable, goal.value);
  
  return {
    conclusion: facts,
    trace,
    success
  };
}
