export interface TruthTableRow {
  inputs: Record<string, boolean>;
  output: boolean;
}

export interface BooleanResult {
  original: string;
  simplified: string;
  truthTable: TruthTableRow[];
  variables: string[];
}

function tokenize(expr: string): string[] {
  return expr
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/&&/g, ' && ')
    .replace(/\|\|/g, ' || ')
    .replace(/!/g, ' ! ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

function parseExpression(tokens: string[]): any {
  let pos = 0;
  
  function parseOr(): any {
    let left = parseAnd();
    while (pos < tokens.length && tokens[pos] === '||') {
      pos++;
      const right = parseAnd();
      left = { type: 'OR', left, right };
    }
    return left;
  }
  
  function parseAnd(): any {
    let left = parseUnary();
    while (pos < tokens.length && tokens[pos] === '&&') {
      pos++;
      const right = parseUnary();
      left = { type: 'AND', left, right };
    }
    return left;
  }
  
  function parseUnary(): any {
    if (tokens[pos] === '!') {
      pos++;
      return { type: 'NOT', operand: parseUnary() };
    }
    return parsePrimary();
  }
  
  function parsePrimary(): any {
    if (tokens[pos] === '(') {
      pos++;
      const expr = parseOr();
      pos++; // skip ')'
      return expr;
    }
    const variable = tokens[pos];
    pos++;
    return { type: 'VAR', name: variable };
  }
  
  return parseOr();
}

function evaluateAST(ast: any, values: Record<string, boolean>): boolean {
  switch (ast.type) {
    case 'VAR':
      return values[ast.name] || false;
    case 'NOT':
      return !evaluateAST(ast.operand, values);
    case 'AND':
      return evaluateAST(ast.left, values) && evaluateAST(ast.right, values);
    case 'OR':
      return evaluateAST(ast.left, values) || evaluateAST(ast.right, values);
    default:
      return false;
  }
}

function extractVariables(ast: any): Set<string> {
  const vars = new Set<string>();
  
  function traverse(node: any) {
    if (!node) return;
    if (node.type === 'VAR') {
      vars.add(node.name);
    } else if (node.type === 'NOT') {
      traverse(node.operand);
    } else if (node.type === 'AND' || node.type === 'OR') {
      traverse(node.left);
      traverse(node.right);
    }
  }
  
  traverse(ast);
  return vars;
}

function astToString(ast: any): string {
  switch (ast.type) {
    case 'VAR':
      return ast.name;
    case 'NOT':
      return `!${astToString(ast.operand)}`;
    case 'AND':
      return `(${astToString(ast.left)} && ${astToString(ast.right)})`;
    case 'OR':
      return `(${astToString(ast.left)} || ${astToString(ast.right)})`;
    default:
      return '';
  }
}

function simplifyAST(ast: any): any {
  if (!ast) return ast;
  
  // Recursively simplify children first
  if (ast.type === 'NOT') {
    const simplified = simplifyAST(ast.operand);
    
    // Double negation: !!A = A
    if (simplified.type === 'NOT') {
      return simplified.operand;
    }
    
    return { type: 'NOT', operand: simplified };
  }
  
  if (ast.type === 'AND' || ast.type === 'OR') {
    const left = simplifyAST(ast.left);
    const right = simplifyAST(ast.right);
    
    // Identity laws
    if (ast.type === 'AND') {
      // A && A = A
      if (JSON.stringify(left) === JSON.stringify(right)) {
        return left;
      }
    }
    
    if (ast.type === 'OR') {
      // A || A = A
      if (JSON.stringify(left) === JSON.stringify(right)) {
        return left;
      }
    }
    
    return { type: ast.type, left, right };
  }
  
  return ast;
}

export function analyzeBoolean(expression: string): BooleanResult {
  try {
    const tokens = tokenize(expression);
    const ast = parseExpression(tokens);
    const variables = Array.from(extractVariables(ast)).sort();
    
    // Generate truth table
    const truthTable: TruthTableRow[] = [];
    const numRows = Math.pow(2, variables.length);
    
    for (let i = 0; i < numRows; i++) {
      const inputs: Record<string, boolean> = {};
      variables.forEach((variable, index) => {
        inputs[variable] = Boolean((i >> (variables.length - 1 - index)) & 1);
      });
      
      const output = evaluateAST(ast, inputs);
      truthTable.push({ inputs, output });
    }
    
    // Simple simplification
    const simplifiedAST = simplifyAST(ast);
    const simplified = astToString(simplifiedAST);
    
    return {
      original: expression,
      simplified: simplified.replace(/^\(|\)$/g, ''), // Remove outer parentheses
      truthTable,
      variables
    };
  } catch (error) {
    console.error('Boolean parsing error:', error);
    return {
      original: expression,
      simplified: 'Error parsing expression',
      truthTable: [],
      variables: []
    };
  }
}
