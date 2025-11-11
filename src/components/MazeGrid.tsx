import { Cell } from "@/lib/mazeGenerator";
import { cn } from "@/lib/utils";

interface MazeGridProps {
  maze: Cell[][];
  cellSize?: number;
}

export const MazeGrid = ({ maze, cellSize = 30 }: MazeGridProps) => {
  const getCellClassName = (cell: Cell) => {
    if (cell.isStart) return "bg-maze-start";
    if (cell.isGoal) return "bg-maze-goal";
    if (cell.isWall) return "bg-maze-wall";
    if (cell.isPath) return "bg-maze-path animate-pulse";
    if (cell.isVisited) return "bg-maze-visited";
    return "bg-maze-empty";
  };

  return (
    <div className="inline-block border-2 border-border rounded-lg overflow-hidden shadow-lg">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${maze[0]?.length || 0}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${maze.length}, ${cellSize}px)`,
        }}
      >
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "border border-border/20 transition-colors duration-200",
                getCellClassName(cell)
              )}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
