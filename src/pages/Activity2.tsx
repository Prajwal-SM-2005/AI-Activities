import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RouteMap } from "@/components/RouteMap";
import { generateCityGraph, Graph, resetGraph } from "@/lib/graphGenerator";
import { bfsRouting, dfsRouting, ucsRouting, aStarRouting, RoutingResult } from "@/lib/routingAlgorithms";
import { ArrowLeft, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Activity2 = () => {
  const navigate = useNavigate();
  const [numBins, setNumBins] = useState(8);
  const [gridSize] = useState(10);
  const [algorithm, setAlgorithm] = useState<"BFS" | "DFS" | "UCS" | "A*">("A*");
  const [graph, setGraph] = useState<Graph | null>(null);
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedVisited, setAnimatedVisited] = useState<any[]>([]);
  const [animatedRoute, setAnimatedRoute] = useState<any[]>([]);
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  const [stats, setStats] = useState<{
    algorithm: string;
    totalDistance: number;
    timeTaken: number;
    nodesExpanded: number;
  } | null>(null);
  const [routeText, setRouteText] = useState<string>("");

  const runAlgorithm = () => {
    setIsAnimating(true);
    setAnimatedVisited([]);
    setAnimatedRoute([]);
    setCurrentPosition(null);
    setResult(null);
    setStats(null);
    setRouteText("");

    // Generate new graph
    const newGraph = generateCityGraph(numBins, gridSize);
    setGraph(newGraph);
    resetGraph(newGraph);

    // Run algorithm
    const startTime = performance.now();
    let algorithmResult: RoutingResult;

    switch (algorithm) {
      case "BFS":
        algorithmResult = bfsRouting(newGraph);
        break;
      case "DFS":
        algorithmResult = dfsRouting(newGraph);
        break;
      case "UCS":
        algorithmResult = ucsRouting(newGraph);
        break;
      case "A*":
        algorithmResult = aStarRouting(newGraph);
        break;
    }

    const endTime = performance.now();
    const timeTaken = Math.round((endTime - startTime) * 100) / 100;

    setResult(algorithmResult);

    // Animate visited nodes
    let visitedIndex = 0;
    const visitedInterval = setInterval(() => {
      if (visitedIndex < algorithmResult.visitedOrder.length) {
        setAnimatedVisited((prev) => [...prev, algorithmResult.visitedOrder[visitedIndex]]);
        visitedIndex++;
      } else {
        clearInterval(visitedInterval);
        // Animate route with current position tracking
        let routeIndex = 0;
        const routeInterval = setInterval(() => {
          if (routeIndex < algorithmResult.route.length) {
            const currentNode = algorithmResult.route[routeIndex];
            setCurrentPosition(currentNode);
            setAnimatedRoute((prev) => [...prev, currentNode]);
            routeIndex++;
          } else {
            clearInterval(routeInterval);
            setCurrentPosition(null);
            setIsAnimating(false);
            
            // Generate route text
            const routeTextParts = algorithmResult.route.map((node, index) => {
              if (node.isDepot) {
                return `Depot (${node.x},${node.y})`;
              } else if (node.isBin) {
                return `Bin ${node.id} (${node.x},${node.y})`;
              }
              return `(${node.x},${node.y})`;
            });
            setRouteText(routeTextParts.join(" → "));
            
            setStats({
              algorithm,
              totalDistance: algorithmResult.totalDistance,
              timeTaken,
              nodesExpanded: algorithmResult.nodesExpanded,
            });
          }
        }, 400);
      }
    }, 50);
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

        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Activity 2 – Smart Waste Collection Routing
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Optimize waste collection routes using different pathfinding algorithms.
            Find the most efficient way to visit all bins and return to the depot.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Configuration</CardTitle>
                <CardDescription>Set up your waste collection parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bins">Number of Waste Bins</Label>
                  <Input
                    id="bins"
                    type="number"
                    min="3"
                    max="15"
                    value={numBins}
                    onChange={(e) => setNumBins(parseInt(e.target.value) || 8)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Routing Algorithm</Label>
                  <Select value={algorithm} onValueChange={(value: any) => setAlgorithm(value)}>
                    <SelectTrigger id="algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BFS">BFS (Breadth-First Search)</SelectItem>
                      <SelectItem value="DFS">DFS (Depth-First Search)</SelectItem>
                      <SelectItem value="UCS">UCS (Uniform Cost Search)</SelectItem>
                      <SelectItem value="A*">A* (A-Star)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={runAlgorithm} disabled={isAnimating} className="w-full">
                  {isAnimating ? "Planning Route..." : "Generate & Plan Route"}
                </Button>
              </CardContent>
            </Card>

            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Route Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Algorithm:</span>
                    <span className="font-semibold">{stats.algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Distance:</span>
                    <span className="font-semibold">{stats.totalDistance} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Taken:</span>
                    <span className="font-semibold">{stats.timeTaken} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nodes Expanded:</span>
                    <span className="font-semibold">{stats.nodesExpanded}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>City Map</CardTitle>
                <CardDescription>
                  🏠 Depot (start/end) • 🗑️ Waste Bins • Green line shows optimal route
                </CardDescription>
              </CardHeader>
              <CardContent>
                {graph ? (
                  <RouteMap
                    graph={graph}
                    visitedNodes={animatedVisited}
                    route={animatedRoute}
                    isAnimating={isAnimating}
                    gridSize={gridSize}
                    currentPosition={currentPosition}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                      Click "Generate & Plan Route" to start
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Text Display */}
            {routeText && (
              <Card>
                <CardHeader>
                  <CardTitle>Collection Route</CardTitle>
                  <CardDescription>Sequence of locations visited by the waste collection truck</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm font-mono text-foreground break-all leading-relaxed">
                      <span className="font-semibold text-primary">Route:</span> {routeText}
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

export default Activity2;
