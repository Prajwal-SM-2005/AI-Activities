import { ActivityCard } from "@/components/ActivityCard";
import { Brain, Home, Lightbulb, Network, Puzzle, Target } from "lucide-react";

const Index = () => {
  const activities = [
    {
      title: "Activity 1",
      description: "AI Maze Solver - Visualize pathfinding algorithms like BFS, DFS, A*, and Greedy",
      icon: Puzzle,
      to: "/activity-1",
      available: true,
    },
    {
      title: "Activity 2",
      description: "Smart Waste Collection Routing - Optimize routes using BFS, DFS, UCS, and A*",
      icon: Network,
      to: "/activity-2",
      available: true,
    },
    {
      title: "Activity 3A",
      description: "Symbolic Fault Diagnosis - Use logic inference to diagnose system faults",
      icon: Lightbulb,
      to: "/activity-3a",
      available: true,
    },
    {
      title: "Activity 3B",
      description: "Logic Circuit Simulation - Simplify Boolean expressions and generate truth tables",
      icon: Target,
      to: "/activity-3b",
      available: true,
    },
    {
      title: "Activity 4",
      description: "Wumpus World Reasoning - Use logical inference to deduce the Wumpus location",
      icon: Brain,
      to: "/activity-4",
      available: true,
    },
    {
      title: "Activity 5",
      description: "Smart Home Assistant - Logic-based chatbot with forward and backward chaining",
      icon: Home,
      to: "/activity-5",
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            ARTIFICIAL INTELLIGENCE ACTIVITIES
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore interactive AI algorithms and concepts through hands-on activities
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {activities.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
