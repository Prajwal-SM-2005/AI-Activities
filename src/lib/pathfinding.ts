import { Cell } from "./mazeGenerator";

export type PathfindingResult = {
  visitedOrder: Cell[];
  path: Cell[];
  pathLength: number;
  nodesVisited: number;
};

const getNeighbors = (cell: Cell, maze: Cell[][]): Cell[] => {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  const rows = maze.length;
  const cols = maze[0].length;

  // Up, Right, Down, Left
  const directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (
      newRow >= 0 &&
      newRow < rows &&
      newCol >= 0 &&
      newCol < cols &&
      !maze[newRow][newCol].isWall
    ) {
      neighbors.push(maze[newRow][newCol]);
    }
  }

  return neighbors;
};

const reconstructPath = (endCell: Cell): Cell[] => {
  const path: Cell[] = [];
  let current: Cell | null = endCell;

  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
};

const manhattanDistance = (cell1: Cell, cell2: Cell): number => {
  return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
};

export const bfs = (maze: Cell[][]): PathfindingResult => {
  const startCell = maze[0][0];
  const goalCell = maze[maze.length - 1][maze[0].length - 1];
  const visitedOrder: Cell[] = [];
  const queue: Cell[] = [startCell];

  startCell.isVisited = true;
  startCell.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedOrder.push(current);

    if (current.isGoal) {
      const path = reconstructPath(current);
      return {
        visitedOrder,
        path,
        pathLength: path.length,
        nodesVisited: visitedOrder.length,
      };
    }

    const neighbors = getNeighbors(current, maze);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.parent = current;
        neighbor.distance = current.distance + 1;
        queue.push(neighbor);
      }
    }
  }

  return { visitedOrder, path: [], pathLength: 0, nodesVisited: visitedOrder.length };
};

export const dfs = (maze: Cell[][]): PathfindingResult => {
  const startCell = maze[0][0];
  const visitedOrder: Cell[] = [];
  const stack: Cell[] = [startCell];

  startCell.isVisited = true;

  while (stack.length > 0) {
    const current = stack.pop()!;
    visitedOrder.push(current);

    if (current.isGoal) {
      const path = reconstructPath(current);
      return {
        visitedOrder,
        path,
        pathLength: path.length,
        nodesVisited: visitedOrder.length,
      };
    }

    const neighbors = getNeighbors(current, maze);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.parent = current;
        stack.push(neighbor);
      }
    }
  }

  return { visitedOrder, path: [], pathLength: 0, nodesVisited: visitedOrder.length };
};

export const aStar = (maze: Cell[][]): PathfindingResult => {
  const startCell = maze[0][0];
  const goalCell = maze[maze.length - 1][maze[0].length - 1];
  const visitedOrder: Cell[] = [];
  const openSet: Cell[] = [startCell];

  startCell.distance = 0;
  startCell.heuristic = manhattanDistance(startCell, goalCell);

  while (openSet.length > 0) {
    // Find cell with lowest f-score (distance + heuristic)
    openSet.sort((a, b) => {
      const fA = a.distance + a.heuristic;
      const fB = b.distance + b.heuristic;
      return fA - fB;
    });

    const current = openSet.shift()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visitedOrder.push(current);

    if (current.isGoal) {
      const path = reconstructPath(current);
      return {
        visitedOrder,
        path,
        pathLength: path.length,
        nodesVisited: visitedOrder.length,
      };
    }

    const neighbors = getNeighbors(current, maze);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited) continue;

      const tentativeDistance = current.distance + 1;

      if (tentativeDistance < neighbor.distance) {
        neighbor.parent = current;
        neighbor.distance = tentativeDistance;
        neighbor.heuristic = manhattanDistance(neighbor, goalCell);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return { visitedOrder, path: [], pathLength: 0, nodesVisited: visitedOrder.length };
};

export const greedy = (maze: Cell[][]): PathfindingResult => {
  const startCell = maze[0][0];
  const goalCell = maze[maze.length - 1][maze[0].length - 1];
  const visitedOrder: Cell[] = [];
  const openSet: Cell[] = [startCell];

  startCell.heuristic = manhattanDistance(startCell, goalCell);

  while (openSet.length > 0) {
    // Find cell with lowest heuristic (greedy approach)
    openSet.sort((a, b) => a.heuristic - b.heuristic);

    const current = openSet.shift()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visitedOrder.push(current);

    if (current.isGoal) {
      const path = reconstructPath(current);
      return {
        visitedOrder,
        path,
        pathLength: path.length,
        nodesVisited: visitedOrder.length,
      };
    }

    const neighbors = getNeighbors(current, maze);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !openSet.includes(neighbor)) {
        neighbor.parent = current;
        neighbor.heuristic = manhattanDistance(neighbor, goalCell);
        openSet.push(neighbor);
      }
    }
  }

  return { visitedOrder, path: [], pathLength: 0, nodesVisited: visitedOrder.length };
};
