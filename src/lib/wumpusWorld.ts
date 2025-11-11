export interface Cell {
  x: number;
  y: number;
  hasWumpus: boolean;
  hasPit: boolean;
  isAgent: boolean;
  isVisited: boolean;
  hasStench: boolean;
  hasBreeze: boolean;
  isSafe: boolean;
  isInferredWumpus: boolean;
  isPossibleWumpus: boolean;
}

export interface WumpusWorld {
  grid: Cell[][];
  size: number;
  wumpusLocation: { x: number; y: number } | null;
  agentPath: { x: number; y: number }[];
  inferenceTrace: string[];
}

export function generateWumpusWorld(size: number, numPits: number = 3): WumpusWorld {
  const grid: Cell[][] = [];
  
  // Initialize grid
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      grid[y][x] = {
        x,
        y,
        hasWumpus: false,
        hasPit: false,
        isAgent: x === 0 && y === 0,
        isVisited: x === 0 && y === 0,
        hasStench: false,
        hasBreeze: false,
        isSafe: x === 0 && y === 0,
        isInferredWumpus: false,
        isPossibleWumpus: false,
      };
    }
  }

  // Place Wumpus (not at start or adjacent to start)
  let wumpusX, wumpusY;
  do {
    wumpusX = Math.floor(Math.random() * size);
    wumpusY = Math.floor(Math.random() * size);
  } while (
    (wumpusX === 0 && wumpusY === 0) || 
    (Math.abs(wumpusX - 0) + Math.abs(wumpusY - 0) <= 1)
  );
  grid[wumpusY][wumpusX].hasWumpus = true;

  // Place pits (not at start, not where Wumpus is)
  let pitsPlaced = 0;
  while (pitsPlaced < numPits) {
    const pitX = Math.floor(Math.random() * size);
    const pitY = Math.floor(Math.random() * size);
    if (
      !grid[pitY][pitX].hasPit &&
      !grid[pitY][pitX].hasWumpus &&
      !(pitX === 0 && pitY === 0)
    ) {
      grid[pitY][pitX].hasPit = true;
      pitsPlaced++;
    }
  }

  // Calculate percepts
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x].hasWumpus && !grid[y][x].hasPit) {
        const adjacent = getAdjacentCells(x, y, size);
        grid[y][x].hasStench = adjacent.some(([ax, ay]) => grid[ay][ax].hasWumpus);
        grid[y][x].hasBreeze = adjacent.some(([ax, ay]) => grid[ay][ax].hasPit);
      }
    }
  }

  return {
    grid,
    size,
    wumpusLocation: { x: wumpusX, y: wumpusY },
    agentPath: [{ x: 0, y: 0 }],
    inferenceTrace: ['Agent starts at (0,0)'],
  };
}

function getAdjacentCells(x: number, y: number, size: number): [number, number][] {
  const adjacent: [number, number][] = [];
  if (x > 0) adjacent.push([x - 1, y]);
  if (x < size - 1) adjacent.push([x + 1, y]);
  if (y > 0) adjacent.push([x, y - 1]);
  if (y < size - 1) adjacent.push([x, y + 1]);
  return adjacent;
}

export function exploreWorld(world: WumpusWorld): WumpusWorld {
  const { grid, size, inferenceTrace } = world;
  const visited = new Set<string>();
  const queue: [number, number][] = [[0, 0]];
  const path: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  
  visited.add('0,0');

  // Knowledge base: track possible Wumpus locations
  const possibleWumpusLocations = new Set<string>();
  const impossibleWumpusLocations = new Set<string>();

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const cell = grid[y][x];

    // Analyze percepts
    if (cell.hasStench) {
      inferenceTrace.push(`Stench detected at (${x},${y}) → Wumpus in adjacent cell`);
      const adjacent = getAdjacentCells(x, y, size);
      adjacent.forEach(([ax, ay]) => {
        if (!visited.has(`${ax},${ay}`) && !impossibleWumpusLocations.has(`${ax},${ay}`)) {
          possibleWumpusLocations.add(`${ax},${ay}`);
          grid[ay][ax].isPossibleWumpus = true;
        }
      });
    } else {
      // No stench means adjacent cells don't have Wumpus
      const adjacent = getAdjacentCells(x, y, size);
      adjacent.forEach(([ax, ay]) => {
        impossibleWumpusLocations.add(`${ax},${ay}`);
        possibleWumpusLocations.delete(`${ax},${ay}`);
        grid[ay][ax].isPossibleWumpus = false;
      });
    }

    if (cell.hasBreeze) {
      inferenceTrace.push(`Breeze detected at (${x},${y}) → Pit in adjacent cell`);
    }

    if (!cell.hasStench && !cell.hasBreeze) {
      inferenceTrace.push(`No percepts at (${x},${y}) → Adjacent cells are safe`);
      const adjacent = getAdjacentCells(x, y, size);
      adjacent.forEach(([ax, ay]) => {
        grid[ay][ax].isSafe = true;
      });
    }

    // Check if Wumpus location can be deduced
    if (possibleWumpusLocations.size === 1) {
      const [wumpusKey] = Array.from(possibleWumpusLocations);
      const [wx, wy] = wumpusKey.split(',').map(Number);
      grid[wy][wx].isInferredWumpus = true;
      inferenceTrace.push(`✓ Wumpus location deduced: (${wx},${wy})`);
      break;
    }

    // Explore safe adjacent cells
    const adjacent = getAdjacentCells(x, y, size);
    for (const [ax, ay] of adjacent) {
      if (!visited.has(`${ax},${ay}`) && !grid[ay][ax].hasPit && grid[ay][ax].isSafe) {
        visited.add(`${ax},${ay}`);
        grid[ay][ax].isVisited = true;
        queue.push([ax, ay]);
        path.push({ x: ax, y: ay });
      }
    }
  }

  return { ...world, agentPath: path, inferenceTrace };
}
