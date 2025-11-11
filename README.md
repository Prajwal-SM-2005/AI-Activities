# 🤖 Artificial Intelligence Lab Activities

This repository contains a collection of interactive AI activities demonstrating the core principles of Artificial Intelligence — from pathfinding and logical inference to knowledge-based reasoning and automation.  
Each activity is implemented as a separate module with an intuitive interface and visual outputs.

---

## 🧠 Activities Overview

### **Activity 1: AI Maze Solver**
- **Concept:** Search Algorithms for Pathfinding  
- **Algorithms Used:** BFS, DFS, A*, Greedy  
- **Goal:** Solve a custom or random maze from `(0,0)` to goal  
- **Features:**
  - Visual grid display  
  - Path animation and time calculation  
  - Text-based path output like `(0,0) → (1,2) → (2,3)`  
  - Back to Home button for easy navigation  

---

### **Activity 2: Smart Waste Collection Routing**
- **Concept:** Route Optimization for Waste Collection  
- **Algorithms Used:** BFS, DFS, Uniform Cost Search, A*  
- **Goal:** Plan the most efficient route for a garbage truck to collect waste from multiple bins  
- **Features:**
  - City grid with bordered cells (white or sky-blue)  
  - Animated traversal showing route flow  
  - Display of path in text format  
  - Back to Home button included  

---

### **Activity 3A: Symbolic Fault Diagnosis**
- **Concept:** Logic-Based Fault Diagnosis  
- **Technique:** Forward and Backward Chaining  
- **Goal:** Infer possible system faults based on observed symptoms  
- **Example Rules:**
  - `IF Power = Off THEN Fault = PowerFailure`  
  - `IF Sensor = Faulty THEN Fault = SensorError`  
  - `IF Temperature = High AND Cooling = Off THEN Fault = OverheatingRisk`  

---

### **Activity 3B: Logic Circuit Simulation via Boolean Algebra**
- **Concept:** Logic Simplification and Circuit Optimization  
- **Techniques Used:** Karnaugh Maps, Quine-McCluskey Algorithm  
- **Goal:** Simplify logic expressions and simulate circuits symbolically  
- **Features:**
  - Boolean expression parsing  
  - Simplification visualization  
  - Optimized circuit representation  

---

### **Activity 4: Wumpus World Inference**
- **Concept:** Knowledge Representation and Reasoning (First-Order Logic)  
- **Goal:** Deduce the Wumpus’s exact location in a randomly generated grid using percepts such as **stench**, **breeze**, and **safe cells**  
- **Features:**
  - Logical inference engine  
  - Real-time reasoning visualization  
  - Back to Home button  

---

### **Activity 5: Smart Home Assistant**
- **Concept:** Logic-Based Decision System for Home Automation  
- **Techniques Used:** Propositional & First-Order Logic, Forward/Backward Chaining  
- **Knowledge Base Example:**
  - `If MotionDetected ∧ NightTime → TurnOn(Lights)`  
  - `If Temperature(Room, T) ∧ T < 18°C → TurnOn(Heater)`  
  - `If TurnOn(Heater) → IncreaseEnergyUsage`  
  - `If EnergyUsageHigh → Alert(User)`  
- **Features:**
  - Chat interface for fact and query input  
  - Automatic inference of actions  
  - “Why?” queries supported via backward chaining  
  - Displays full fact base after inference  

---

## 📘 Project Info and Steps to Run

The only requirement is having **Node.js & npm** installed —  
[Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```bash
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

---

## 👨‍💻 Author

**Prajwal S M**  
*Front-End & AI Developer*  

[🌐 GitHub Profile](https://github.com/Prajwal-SM-2005)

