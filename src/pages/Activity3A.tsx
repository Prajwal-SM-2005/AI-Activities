import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseRules, parseFacts, forwardChaining, backwardChaining, InferenceResult } from "@/lib/logicInference";

const Activity3A = () => {
  const navigate = useNavigate();
  const [rulesText, setRulesText] = useState(
    "Rule 1: IF Power = Off THEN Fault = PowerFailure\nRule 2: IF Sensor = Faulty THEN Fault = SensorError\nRule 3: IF Temperature = High AND Cooling = Off THEN Fault = OverheatingRisk"
  );
  const [factsText, setFactsText] = useState("Power = Off");
  const [inferenceType, setInferenceType] = useState<"forward" | "backward">("forward");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [goalVariable, setGoalVariable] = useState("Fault");

  const handleDiagnose = () => {
    const rules = parseRules(rulesText);
    const facts = parseFacts(factsText);

    let inferenceResult: InferenceResult;

    if (inferenceType === "forward") {
      inferenceResult = forwardChaining(rules, facts);
    } else {
      inferenceResult = backwardChaining(rules, facts, { variable: goalVariable });
    }

    setResult(inferenceResult);
  };

  const handleReset = () => {
    setResult(null);
    setRulesText("Rule 1: IF Power = Off THEN Fault = PowerFailure\nRule 2: IF Sensor = Faulty THEN Fault = SensorError\nRule 3: IF Temperature = High AND Cooling = Off THEN Fault = OverheatingRisk");
    setFactsText("Power = Off");
    setGoalVariable("Fault");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Activity 3A – Symbolic Fault Diagnosis
          </h1>
          <p className="text-muted-foreground">
            Use logical inference (forward/backward chaining) to diagnose system faults
          </p>
        </div>

        <div className="grid gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>System Rules</CardTitle>
              <CardDescription>
                Define logical rules in the format: IF [condition] THEN [conclusion]
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                placeholder="Rule 1: IF Power = Off THEN Fault = PowerFailure"
                className="min-h-[120px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observed Symptoms (Facts)</CardTitle>
              <CardDescription>
                Enter known facts about the system state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={factsText}
                onChange={(e) => setFactsText(e.target.value)}
                placeholder="Power = Off"
                className="min-h-[80px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inference Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reasoning Type</Label>
                <Select value={inferenceType} onValueChange={(val) => setInferenceType(val as "forward" | "backward")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forward">Forward Chaining</SelectItem>
                    <SelectItem value="backward">Backward Chaining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inferenceType === "backward" && (
                <div className="space-y-2">
                  <Label>Goal Variable</Label>
                  <Textarea
                    value={goalVariable}
                    onChange={(e) => setGoalVariable(e.target.value)}
                    placeholder="Fault"
                    className="h-10 font-mono text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleDiagnose} className="flex-1">
                  Diagnose Faults
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle>Diagnosis Results</CardTitle>
                  <CardDescription>
                    {inferenceType === "forward" ? "Forward Chaining" : "Backward Chaining"} Inference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Inferred Facts:</Label>
                      <div className="bg-background rounded-md p-4 space-y-1 font-mono text-sm">
                        {Object.entries(result.conclusion).map(([variable, value]) => (
                          <div key={variable} className="text-foreground">
                            <span className="text-primary font-semibold">{variable}</span> = {value}
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.success !== undefined && (
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold">Status:</Label>
                        <span className={`font-semibold ${result.success ? 'text-green-600' : 'text-destructive'}`}>
                          {result.success ? '✓ Goal Proven' : '✗ Goal Not Proven'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reasoning Trace</CardTitle>
                  <CardDescription>
                    Step-by-step inference process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-md p-4 space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                    {result.trace.map((step, index) => (
                      <div key={index} className="text-foreground py-1 border-l-2 border-primary/30 pl-3">
                        {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity3A;
