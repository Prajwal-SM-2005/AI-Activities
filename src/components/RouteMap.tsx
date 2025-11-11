import { Graph, Node } from "@/lib/graphGenerator";
import { cn } from "@/lib/utils";

interface RouteMapProps {
  graph: Graph;
  visitedNodes: Node[];
  route: Node[];
  isAnimating: boolean;
  gridSize: number;
  currentPosition?: Node;
}

export const RouteMap = ({ graph, visitedNodes, route, isAnimating, gridSize, currentPosition }: RouteMapProps) => {
  // Create a 2D grid representation
  const grid: (Node | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  // Place nodes in grid
  graph.nodes.forEach((node) => {
    if (node.x >= 0 && node.x < gridSize && node.y >= 0 && node.y < gridSize) {
      grid[node.y][node.x] = node;
    }
  });

  const getCellClassName = (node: Node | null, rowIndex: number, colIndex: number) => {
    if (!node) {
      // Check if this cell is in the completed route path
      const isInCompletedPath = route.some((routeNode, index) => {
        if (index === 0) return false; // Skip first node
        const prevNode = route[index - 1];
        
        // Check if current cell is between two route nodes (for path visualization)
        if (prevNode.x === routeNode.x && colIndex === prevNode.x) {
          // Vertical path
          const minY = Math.min(prevNode.y, routeNode.y);
          const maxY = Math.max(prevNode.y, routeNode.y);
          return rowIndex > minY && rowIndex < maxY;
        }
        if (prevNode.y === routeNode.y && rowIndex === prevNode.y) {
          // Horizontal path
          const minX = Math.min(prevNode.x, routeNode.x);
          const maxX = Math.max(prevNode.x, routeNode.x);
          return colIndex > minX && colIndex < maxX;
        }
        return false;
      });
      
      return isInCompletedPath ? "bg-green-500/30" : "bg-background";
    }

    // Current position (yellow)
    if (currentPosition && node.id === currentPosition.id) {
      return "bg-yellow-400 animate-pulse";
    }

    // Depot (green)
    if (node.isDepot) {
      return "bg-green-500";
    }

    // Bins
    if (node.isBin) {
      const isInRoute = route.some((r) => r.id === node.id);
      return isInRoute ? "bg-green-500" : "bg-blue-500";
    }

    return "bg-background";
  };

  const getCellContent = (node: Node | null) => {
    if (!node) return null;
    
    if (node.isDepot) {
      return (
        <div className="flex items-center justify-center h-full text-2xl">
          🏠
        </div>
      );
    }
    
    if (node.isBin) {
      return (
        <div className="flex items-center justify-center h-full text-xl">
          🗑️
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex justify-center items-center bg-card rounded-lg p-4 shadow-sm">
      <div className="inline-block border-2 border-sky-300 rounded-lg overflow-hidden shadow-lg">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 50px)`,
            gridTemplateRows: `repeat(${gridSize}, 50px)`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "border border-sky-200 transition-all duration-300",
                  getCellClassName(cell, rowIndex, colIndex)
                )}
                style={{
                  width: "50px",
                  height: "50px",
                }}
              >
                {getCellContent(cell)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
