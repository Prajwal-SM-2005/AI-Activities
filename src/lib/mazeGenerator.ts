export type Cell = {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isGoal: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  heuristic: number;
  parent: Cell | null;
};

export const generateMaze = (rows: number, cols: number): Cell[][] => {
  const maze: Cell[][] = [];
  
  // Initialize grid
  for (let row = 0; row < rows; row++) {
    maze[row] = [];
    for (let col = 0; col < cols; col++) {
      maze[row][col] = {
        row,
        col,
        isWall: false,
        isStart: row === 0 && col === 0,
        isGoal: row === rows - 1 && col === cols - 1,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        heuristic: 0,
        parent: null,
      };
    }
  }

  // Add random walls (30% density, but ensure path exists)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Don't place walls at start or goal
      if ((row === 0 && col === 0) || (row === rows - 1 && col === cols - 1)) {
        continue;
      }
      
      // Random wall with 25% probability
      if (Math.random() < 0.25) {
        maze[row][col].isWall = true;
      }
    }
  }

  return maze;
};

export const resetMazeState = (maze: Cell[][]): Cell[][] => {
  return maze.map(row =>
    row.map(cell => ({
      ...cell,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      heuristic: 0,
      parent: null,
    }))
  );
};
