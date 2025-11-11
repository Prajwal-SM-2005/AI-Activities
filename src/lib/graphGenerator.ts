export interface Node {
  id: number;
  x: number;
  y: number;
  isDepot: boolean;
  isBin: boolean;
  visited: boolean;
  parent: Node | null;
  cost: number;
  heuristic: number;
}

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  adjacencyList: Map<number, { nodeId: number; weight: number }[]>;
}

export const generateCityGraph = (numBins: number, gridSize: number = 10): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const adjacencyList = new Map<number, { nodeId: number; weight: number }[]>();

  // Create depot at center
  const depotNode: Node = {
    id: 0,
    x: Math.floor(gridSize / 2),
    y: Math.floor(gridSize / 2),
    isDepot: true,
    isBin: false,
    visited: false,
    parent: null,
    cost: 0,
    heuristic: 0,
  };
  nodes.push(depotNode);
  adjacencyList.set(0, []);

  // Generate random bin locations
  const usedPositions = new Set<string>();
  usedPositions.add(`${depotNode.x},${depotNode.y}`);

  for (let i = 1; i <= numBins; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while (usedPositions.has(`${x},${y}`));

    usedPositions.add(`${x},${y}`);
    const binNode: Node = {
      id: i,
      x,
      y,
      isDepot: false,
      isBin: true,
      visited: false,
      parent: null,
      cost: Infinity,
      heuristic: 0,
    };
    nodes.push(binNode);
    adjacencyList.set(i, []);
  }

  // Create edges between all nodes (fully connected graph for simplicity)
  // Weight is Euclidean distance
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.sqrt(
        Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
      );
      const weight = Math.round(distance * 10) / 10; // Round to 1 decimal

      const edge: Edge = {
        from: nodes[i].id,
        to: nodes[j].id,
        weight,
      };
      edges.push(edge);

      // Add to adjacency list (bidirectional)
      adjacencyList.get(nodes[i].id)!.push({ nodeId: nodes[j].id, weight });
      adjacencyList.get(nodes[j].id)!.push({ nodeId: nodes[i].id, weight });
    }
  }

  return { nodes, edges, adjacencyList };
};

export const resetGraph = (graph: Graph): void => {
  graph.nodes.forEach((node) => {
    node.visited = false;
    node.parent = null;
    node.cost = node.isDepot ? 0 : Infinity;
    node.heuristic = 0;
  });
};
