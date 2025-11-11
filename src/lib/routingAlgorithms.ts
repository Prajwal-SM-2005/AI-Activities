import { Graph, Node } from "./graphGenerator";

export interface RoutingResult {
  visitedOrder: Node[];
  route: Node[];
  totalDistance: number;
  nodesExpanded: number;
}

const euclideanDistance = (node1: Node, node2: Node): number => {
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
};

const reconstructRoute = (endNode: Node): Node[] => {
  const route: Node[] = [];
  let current: Node | null = endNode;

  while (current !== null) {
    route.unshift(current);
    current = current.parent;
  }

  return route;
};

const findNearestUnvisitedBin = (
  current: Node,
  nodes: Node[],
  visitedBins: Set<number>
): Node | null => {
  let nearest: Node | null = null;
  let minDist = Infinity;

  for (const node of nodes) {
    if (node.isBin && !visitedBins.has(node.id)) {
      const dist = euclideanDistance(current, node);
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }
  }

  return nearest;
};

// BFS for visiting all bins
export const bfsRouting = (graph: Graph): RoutingResult => {
  const { nodes, adjacencyList } = graph;
  const depot = nodes.find((n) => n.isDepot)!;
  const visitedOrder: Node[] = [];
  const route: Node[] = [depot];
  const visitedBins = new Set<number>();
  let totalDistance = 0;

  let current = depot;
  visitedOrder.push(current);

  // Visit all bins using BFS-style nearest neighbor
  while (visitedBins.size < nodes.length - 1) {
    const nearest = findNearestUnvisitedBin(current, nodes, visitedBins);
    if (!nearest) break;

    // BFS exploration
    const queue: Node[] = [current];
    const explored = new Set<number>([current.id]);

    while (queue.length > 0) {
      const node = queue.shift()!;
      visitedOrder.push(node);

      if (node.id === nearest.id) {
        break;
      }

      const neighbors = adjacencyList.get(node.id) || [];
      for (const { nodeId } of neighbors) {
        if (!explored.has(nodeId)) {
          explored.add(nodeId);
          const neighborNode = nodes.find((n) => n.id === nodeId)!;
          queue.push(neighborNode);
        }
      }
    }

    visitedBins.add(nearest.id);
    const dist = euclideanDistance(current, nearest);
    totalDistance += dist;
    route.push(nearest);
    current = nearest;
  }

  // Return to depot
  const returnDist = euclideanDistance(current, depot);
  totalDistance += returnDist;
  route.push(depot);
  visitedOrder.push(depot);

  return {
    visitedOrder,
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    nodesExpanded: visitedOrder.length,
  };
};

// DFS for visiting all bins
export const dfsRouting = (graph: Graph): RoutingResult => {
  const { nodes, adjacencyList } = graph;
  const depot = nodes.find((n) => n.isDepot)!;
  const visitedOrder: Node[] = [];
  const route: Node[] = [depot];
  const visitedBins = new Set<number>();
  let totalDistance = 0;

  let current = depot;
  visitedOrder.push(current);

  // Visit all bins using DFS-style exploration
  while (visitedBins.size < nodes.length - 1) {
    const nearest = findNearestUnvisitedBin(current, nodes, visitedBins);
    if (!nearest) break;

    // DFS exploration
    const stack: Node[] = [current];
    const explored = new Set<number>([current.id]);

    while (stack.length > 0) {
      const node = stack.pop()!;
      visitedOrder.push(node);

      if (node.id === nearest.id) {
        break;
      }

      const neighbors = adjacencyList.get(node.id) || [];
      for (const { nodeId } of neighbors) {
        if (!explored.has(nodeId)) {
          explored.add(nodeId);
          const neighborNode = nodes.find((n) => n.id === nodeId)!;
          stack.push(neighborNode);
        }
      }
    }

    visitedBins.add(nearest.id);
    const dist = euclideanDistance(current, nearest);
    totalDistance += dist;
    route.push(nearest);
    current = nearest;
  }

  // Return to depot
  const returnDist = euclideanDistance(current, depot);
  totalDistance += returnDist;
  route.push(depot);
  visitedOrder.push(depot);

  return {
    visitedOrder,
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    nodesExpanded: visitedOrder.length,
  };
};

// Uniform Cost Search
export const ucsRouting = (graph: Graph): RoutingResult => {
  const { nodes, adjacencyList } = graph;
  const depot = nodes.find((n) => n.isDepot)!;
  const visitedOrder: Node[] = [];
  const route: Node[] = [depot];
  const visitedBins = new Set<number>();
  let totalDistance = 0;

  let current = depot;

  // Visit all bins using UCS (Dijkstra)
  while (visitedBins.size < nodes.length - 1) {
    const nearest = findNearestUnvisitedBin(current, nodes, visitedBins);
    if (!nearest) break;

    // Reset costs
    nodes.forEach((n) => {
      n.cost = Infinity;
      n.visited = false;
      n.parent = null;
    });

    current.cost = 0;
    const openSet: Node[] = [current];

    while (openSet.length > 0) {
      // Sort by cost
      openSet.sort((a, b) => a.cost - b.cost);
      const node = openSet.shift()!;

      if (node.visited) continue;
      node.visited = true;
      visitedOrder.push(node);

      if (node.id === nearest.id) {
        break;
      }

      const neighbors = adjacencyList.get(node.id) || [];
      for (const { nodeId, weight } of neighbors) {
        const neighborNode = nodes.find((n) => n.id === nodeId)!;
        if (neighborNode.visited) continue;

        const newCost = node.cost + weight;
        if (newCost < neighborNode.cost) {
          neighborNode.cost = newCost;
          neighborNode.parent = node;
          if (!openSet.includes(neighborNode)) {
            openSet.push(neighborNode);
          }
        }
      }
    }

    visitedBins.add(nearest.id);
    const dist = euclideanDistance(current, nearest);
    totalDistance += dist;
    route.push(nearest);
    current = nearest;
  }

  // Return to depot
  const returnDist = euclideanDistance(current, depot);
  totalDistance += returnDist;
  route.push(depot);

  return {
    visitedOrder,
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    nodesExpanded: visitedOrder.length,
  };
};

// A* Search
export const aStarRouting = (graph: Graph): RoutingResult => {
  const { nodes, adjacencyList } = graph;
  const depot = nodes.find((n) => n.isDepot)!;
  const visitedOrder: Node[] = [];
  const route: Node[] = [depot];
  const visitedBins = new Set<number>();
  let totalDistance = 0;

  let current = depot;

  // Visit all bins using A*
  while (visitedBins.size < nodes.length - 1) {
    const nearest = findNearestUnvisitedBin(current, nodes, visitedBins);
    if (!nearest) break;

    // Reset costs
    nodes.forEach((n) => {
      n.cost = Infinity;
      n.heuristic = 0;
      n.visited = false;
      n.parent = null;
    });

    current.cost = 0;
    current.heuristic = euclideanDistance(current, nearest);
    const openSet: Node[] = [current];

    while (openSet.length > 0) {
      // Sort by f-score (cost + heuristic)
      openSet.sort((a, b) => a.cost + a.heuristic - (b.cost + b.heuristic));
      const node = openSet.shift()!;

      if (node.visited) continue;
      node.visited = true;
      visitedOrder.push(node);

      if (node.id === nearest.id) {
        break;
      }

      const neighbors = adjacencyList.get(node.id) || [];
      for (const { nodeId, weight } of neighbors) {
        const neighborNode = nodes.find((n) => n.id === nodeId)!;
        if (neighborNode.visited) continue;

        const newCost = node.cost + weight;
        if (newCost < neighborNode.cost) {
          neighborNode.cost = newCost;
          neighborNode.heuristic = euclideanDistance(neighborNode, nearest);
          neighborNode.parent = node;
          if (!openSet.includes(neighborNode)) {
            openSet.push(neighborNode);
          }
        }
      }
    }

    visitedBins.add(nearest.id);
    const dist = euclideanDistance(current, nearest);
    totalDistance += dist;
    route.push(nearest);
    current = nearest;
  }

  // Return to depot
  const returnDist = euclideanDistance(current, depot);
  totalDistance += returnDist;
  route.push(depot);

  return {
    visitedOrder,
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    nodesExpanded: visitedOrder.length,
  };
};
