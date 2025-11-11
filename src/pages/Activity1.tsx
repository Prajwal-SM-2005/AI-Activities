import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MazeGrid } from "@/components/MazeGrid";
import { generateMaze, resetMazeState, Cell } from "@/lib/mazeGenerator";
import { bfs, dfs, aStar, greedy, PathfindingResult } from "@/lib/pathfinding";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type Algorithm = "BFS" | "DFS" | "A*" | "Greedy";

const Activity1 = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [algorithm, setAlgorithm] = useState<Algorithm>("BFS");
  const [maze, setMaze] = useState<Cell[][] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<{
    algorithm: string;
    timeMs: number;
    pathLength: number;
    nodesVisited: number;
  } | null>(null);
  const [pathCoordinates, setPathCoordinates] = useState<string>("");
  const { toast } = useToast();

  const runAlgorithm = (maze: Cell[][], algo: Algorithm): PathfindingResult => {
    switch (algo) {
      case "BFS":
        return bfs(maze);
      case "DFS":
        return dfs(maze);
      case "A*":
        return aStar(maze);
      case "Greedy":
        return greedy(maze);
    }
  };

  const animateSolution = async (result: PathfindingResult, mazeCopy: Cell[][]) => {
    // Animate visited cells
    for (const cell of result.visitedOrder) {
      if (!cell.isStart && !cell.isGoal) {
        mazeCopy[cell.row][cell.col].isVisited = true;
      }
      setMaze([...mazeCopy]);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    // Animate path
    for (const cell of result.path) {
      if (!cell.isStart && !cell.isGoal) {
        mazeCopy[cell.row][cell.col].isPath = true;
      }
      setMaze([...mazeCopy]);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const handleGenerateAndSolve = async () => {
    if (rows < 5 || rows > 50 || cols < 5 || cols > 50) {
      toast({
        title: "Invalid size",
        description: "Please enter maze dimensions between 5 and 50",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setStats(null);

    // Generate maze
    const newMaze = generateMaze(rows, cols);
    setMaze(newMaze);

    // Small delay to show the maze before solving
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Solve maze
    const startTime = performance.now();
    const mazeCopy = resetMazeState(newMaze);
    const result = runAlgorithm(mazeCopy, algorithm);
    const endTime = performance.now();

    if (result.path.length === 0) {
      toast({
        title: "No path found",
        description: "The maze has no solution. Try generating a new one.",
        variant: "destructive",
      });
      setIsRunning(false);
      return;
    }

    // Animate the solution
    await animateSolution(result, mazeCopy);

    // Generate path text
    const pathText = result.path
      .map((cell) => `(${cell.row},${cell.col})`)
      .join(" → ");
    setPathCoordinates(pathText);

    setStats({
      algorithm,
      timeMs: endTime - startTime,
      pathLength: result.pathLength,
      nodesVisited: result.nodesVisited,
    });

    setIsRunning(false);

    toast({
      title: "Path found!",
      description: `${algorithm} found a path in ${(endTime - startTime).toFixed(2)}ms`,
    });
  };

  const handleReset = () => {
    setMaze(null);
    setStats(null);
    setPathCoordinates("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Activity 1 – AI Maze Solver
          </h1>
          <p className="text-lg text-muted-foreground">
            Visualize how different pathfinding algorithms navigate through a maze
          </p>
        </header>

        <div className="grid lg:grid-cols-[400px,1fr] gap-8 max-w-7xl mx-auto">
          {/* Control Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Set up your maze and choose an algorithm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Rows (5-50)</Label>
                  <Input
                    id="rows"
                    type="number"
                    min={5}
                    max={50}
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 10)}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cols">Columns (5-50)</Label>
                  <Input
                    id="cols"
                    type="number"
                    min={5}
                    max={50}
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value) || 10)}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select
                    value={algorithm}
                    onValueChange={(value) => setAlgorithm(value as Algorithm)}
                    disabled={isRunning}
                  >
                    <SelectTrigger id="algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BFS">Breadth-First Search (BFS)</SelectItem>
                      <SelectItem value="DFS">Depth-First Search (DFS)</SelectItem>
                      <SelectItem value="A*">A* (A-Star)</SelectItem>
                      <SelectItem value="Greedy">Greedy Best-First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleGenerateAndSolve}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isRunning ? "Running..." : "Generate & Solve"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={isRunning || !maze}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Algorithm:</span>
                    <span className="font-semibold text-primary">{stats.algorithm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Time taken:</span>
                    <span className="font-semibold">{stats.timeMs.toFixed(2)} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Path length:</span>
                    <span className="font-semibold">{stats.pathLength} steps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nodes visited:</span>
                    <span className="font-semibold">{stats.nodesVisited}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-maze-start border border-border" />
                  <span className="text-sm">Start</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-maze-goal border border-border" />
                  <span className="text-sm">Goal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-maze-wall border border-border" />
                  <span className="text-sm">Wall</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-maze-visited border border-border" />
                  <span className="text-sm">Visited</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-maze-path border border-border" />
                  <span className="text-sm">Path</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maze Display */}
          <div className="space-y-6">
            <div className="flex items-start justify-center lg:justify-start">
              {maze ? (
                <div className="overflow-auto max-w-full">
                  <MazeGrid maze={maze} cellSize={Math.max(20, Math.min(40, 800 / Math.max(rows, cols)))} />
                </div>
              ) : (
                <Card className="w-full h-[400px] flex items-center justify-center">
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      Configure the maze and click "Generate & Solve" to begin
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Path Display */}
            {pathCoordinates && (
              <Card>
                <CardHeader>
                  <CardTitle>Solution Path</CardTitle>
                  <CardDescription>Coordinates visited from start to goal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm font-mono text-foreground break-all leading-relaxed">
                      <span className="font-semibold text-primary">Path:</span> {pathCoordinates}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity1;
