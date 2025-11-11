import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateWumpusWorld, exploreWorld, WumpusWorld, Cell } from "@/lib/wumpusWorld";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const Activity4 = () => {
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useState(4);
  const [numPits, setNumPits] = useState(3);
  const [world, setWorld] = useState<WumpusWorld | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [explorationStep, setExplorationStep] = useState(0);

  const handleGenerate = () => {
    const newWorld = generateWumpusWorld(gridSize, numPits);
    setWorld(newWorld);
    setExplorationStep(0);
    setIsExploring(false);
  };

  const handleExplore = async () => {
    if (!world) return;
    setIsExploring(true);
    
    const exploredWorld = exploreWorld(world);
    
    // Animate exploration
    for (let i = 0; i <= exploredWorld.agentPath.length; i++) {
      setExplorationStep(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setWorld(exploredWorld);
    setIsExploring(false);
  };

  const handleReset = () => {
    setWorld(null);
    setExplorationStep(0);
    setIsExploring(false);
  };

  const getCellClassName = (cell: Cell) => {
    if (cell.x === 0 && cell.y === 0) return "bg-green-500";
    if (cell.isInferredWumpus) return "bg-red-500 animate-pulse";
    if (showHidden && cell.hasWumpus) return "bg-red-400";
    if (cell.isPossibleWumpus && explorationStep > 0) return "bg-orange-300";
    if (showHidden && cell.hasPit) return "bg-black";
    if (cell.isVisited && explorationStep > 0) return "bg-blue-200";
    if (cell.isSafe && explorationStep > 0) return "bg-green-100";
    return "bg-white";
  };

  const getCellLabel = (cell: Cell) => {
    const labels: string[] = [];
    if (cell.x === 0 && cell.y === 0) labels.push("A");
    if (cell.isInferredWumpus) labels.push("W!");
    if (showHidden && cell.hasWumpus && !cell.isInferredWumpus) labels.push("W");
    if (showHidden && cell.hasPit) labels.push("P");
    if (cell.hasStench && cell.isVisited && explorationStep > 0) labels.push("S");
    if (cell.hasBreeze && cell.isVisited && explorationStep > 0) labels.push("B");
    return labels.join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Activity 4 – Wumpus World Reasoning
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use logical inference to deduce the Wumpus location based on percepts
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set up your Wumpus World</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gridSize">Grid Size</Label>
                  <Input
                    id="gridSize"
                    type="number"
                    min="4"
                    max="6"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    disabled={isExploring}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numPits">Number of Pits</Label>
                  <Input
                    id="numPits"
                    type="number"
                    min="1"
                    max="5"
                    value={numPits}
                    onChange={(e) => setNumPits(Number(e.target.value))}
                    disabled={isExploring}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showHidden">Debug Mode</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      id="showHidden"
                      checked={showHidden}
                      onCheckedChange={setShowHidden}
                    />
                    <span className="text-sm text-muted-foreground">Show Wumpus/Pits</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleGenerate} disabled={isExploring}>
                  Generate Grid
                </Button>
                {world && (
                  <>
                    <Button onClick={handleExplore} disabled={isExploring} variant="default">
                      {isExploring ? "Exploring..." : "Start Exploration"}
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {world && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Wumpus World Grid</CardTitle>
                  <CardDescription>
                    A=Agent, W=Wumpus, W!=Inferred Wumpus, P=Pit, S=Stench, B=Breeze
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="inline-block border-2 border-border rounded-lg overflow-hidden shadow-lg">
                    <div
                      className="grid gap-0"
                      style={{
                        gridTemplateColumns: `repeat(${gridSize}, 80px)`,
                        gridTemplateRows: `repeat(${gridSize}, 80px)`,
                      }}
                    >
                      {world.grid.map((row, y) =>
                        row.map((cell, x) => (
                          <div
                            key={`${x}-${y}`}
                            className={cn(
                              "border border-border flex items-center justify-center text-sm font-bold transition-all duration-300",
                              getCellClassName(cell)
                            )}
                          >
                            {getCellLabel(cell)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inference Trace</CardTitle>
                  <CardDescription>Logical reasoning steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {world.inferenceTrace.slice(0, explorationStep + 1).map((trace, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-secondary/50 rounded animate-fade-in"
                      >
                        {trace}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {explorationStep > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Exploration Path</CardTitle>
                    <CardDescription>Agent's movement through the grid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-sm">
                      Path: {world.agentPath
                        .slice(0, explorationStep)
                        .map((pos) => `(${pos.x},${pos.y})`)
                        .join(" → ")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {world.grid.some(row => row.some(cell => cell.isInferredWumpus)) && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-300">
                      ✓ Wumpus Location Deduced!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 dark:text-green-300">
                      The agent successfully deduced the Wumpus location at{" "}
                      <strong>
                        (
                        {world.grid.flatMap(row => row).find(c => c.isInferredWumpus)?.x},
                        {world.grid.flatMap(row => row).find(c => c.isInferredWumpus)?.y})
                      </strong>{" "}
                      using logical inference from percepts.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity4;
