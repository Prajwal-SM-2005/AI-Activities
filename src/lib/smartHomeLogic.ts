export interface SmartHomeRule {
  id: number;
  condition: string;
  action: string;
  raw: string;
}

export interface SmartHomeFact {
  key: string;
  value: string | number | boolean;
  timestamp: number;
}

export interface InferenceStep {
  rule: SmartHomeRule;
  newFacts: SmartHomeFact[];
  explanation: string;
}

export const PREDEFINED_RULES: SmartHomeRule[] = [
  {
    id: 1,
    condition: "MotionDetected AND NightTime",
    action: "TurnOn(Lights)",
    raw: "IF MotionDetected ∧ NightTime → TurnOn(Lights)"
  },
  {
    id: 2,
    condition: "Temperature < 18",
    action: "TurnOn(Heater)",
    raw: "IF Temperature(Room, T) ∧ T < 18°C → TurnOn(Heater)"
  },
  {
    id: 3,
    condition: "TurnOn(Heater)",
    action: "IncreaseEnergyUsage",
    raw: "IF TurnOn(Heater) → IncreaseEnergyUsage"
  },
  {
    id: 4,
    condition: "IncreaseEnergyUsage",
    action: "EnergyUsageHigh",
    raw: "IF IncreaseEnergyUsage → EnergyUsageHigh"
  },
  {
    id: 5,
    condition: "EnergyUsageHigh",
    action: "Alert(User)",
    raw: "IF EnergyUsageHigh → Alert(User)"
  }
];

export function parseUserInput(input: string, facts: Map<string, SmartHomeFact>): {
  type: 'fact' | 'query' | 'command' | 'unknown';
  data?: any;
} {
  const lower = input.toLowerCase().trim();

  // Commands
  if (lower === 'show facts' || lower === 'list facts') {
    return { type: 'command', data: 'show_facts' };
  }
  if (lower === 'run forward chaining' || lower === 'forward') {
    return { type: 'command', data: 'forward_chaining' };
  }
  if (lower === 'clear' || lower === 'reset') {
    return { type: 'command', data: 'clear' };
  }

  // Queries (why questions)
  if (lower.startsWith('why ')) {
    let target = lower.substring(4).trim().replace('?', '');
    
    // Normalize common terms to action names
    const normalizations: Record<string, string> = {
      'heater': 'TurnOn(Heater)',
      'lights': 'TurnOn(Lights)',
      'alert': 'Alert(User)',
      'energy usage high': 'EnergyUsageHigh',
      'increase energy usage': 'IncreaseEnergyUsage'
    };
    
    if (normalizations[target]) {
      target = normalizations[target];
    }
    
    return { type: 'query', data: target };
  }

  // Temperature fact: "temperature livingroom 16"
  const tempMatch = lower.match(/temperature\s+(\w+)\s+(\d+)/);
  if (tempMatch) {
    return {
      type: 'fact',
      data: {
        key: 'Temperature',
        value: parseInt(tempMatch[2]),
        room: tempMatch[1]
      }
    };
  }

  // Boolean facts: "motion detected", "nighttime true"
  if (lower.includes('motion detected') || lower === 'motion') {
    return { type: 'fact', data: { key: 'MotionDetected', value: true } };
  }
  if (lower.includes('nighttime') || lower.includes('night time')) {
    return { type: 'fact', data: { key: 'NightTime', value: true } };
  }

  return { type: 'unknown' };
}

function checkCondition(condition: string, facts: Map<string, SmartHomeFact>): boolean {
  // Handle compound conditions
  if (condition.includes('AND')) {
    const parts = condition.split('AND').map(p => p.trim());
    return parts.every(part => checkCondition(part, facts));
  }

  // Temperature comparison
  if (condition.includes('Temperature')) {
    const match = condition.match(/Temperature\s*(<|>|=)\s*(\d+)/);
    if (match) {
      const operator = match[1];
      const threshold = parseInt(match[2]);
      const tempFact = facts.get('Temperature');
      if (tempFact && typeof tempFact.value === 'number') {
        if (operator === '<') return tempFact.value < threshold;
        if (operator === '>') return tempFact.value > threshold;
        if (operator === '=') return tempFact.value === threshold;
      }
    }
    return false;
  }

  // Simple fact check
  const fact = facts.get(condition);
  return fact !== undefined && fact.value === true;
}

export function forwardChaining(facts: Map<string, SmartHomeFact>): InferenceStep[] {
  const steps: InferenceStep[] = [];
  let changed = true;
  let iterations = 0;
  const maxIterations = 10;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const rule of PREDEFINED_RULES) {
      if (checkCondition(rule.condition, facts)) {
        // Check if action is already a fact
        if (!facts.has(rule.action)) {
          const newFact: SmartHomeFact = {
            key: rule.action,
            value: true,
            timestamp: Date.now()
          };
          facts.set(rule.action, newFact);
          
          steps.push({
            rule,
            newFacts: [newFact],
            explanation: `Rule ${rule.id} fired: ${rule.condition} → ${rule.action}`
          });
          
          changed = true;
        }
      }
    }
  }

  return steps;
}

export function backwardChaining(
  goal: string,
  facts: Map<string, SmartHomeFact>,
  rules: SmartHomeRule[] = PREDEFINED_RULES
): { success: boolean; trace: string[] } {
  const trace: string[] = [];
  const visited = new Set<string>();

  function prove(target: string): boolean {
    if (visited.has(target)) return false;
    visited.add(target);

    // Check if already known
    if (facts.has(target)) {
      trace.push(`✓ ${target} is already known`);
      return true;
    }

    // Find rules that can derive this target
    for (const rule of rules) {
      if (rule.action === target) {
        trace.push(`Trying rule ${rule.id}: ${rule.raw}`);
        
        if (checkCondition(rule.condition, facts)) {
          trace.push(`✓ Rule ${rule.id} succeeded: ${rule.condition} is satisfied`);
          return true;
        } else {
          trace.push(`✗ Rule ${rule.id} failed: ${rule.condition} is not satisfied`);
        }
      }
    }

    trace.push(`✗ Cannot prove ${target}`);
    return false;
  }

  const success = prove(goal);
  return { success, trace };
}
