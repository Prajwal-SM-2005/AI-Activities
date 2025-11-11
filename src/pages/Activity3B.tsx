import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyzeBoolean, BooleanResult } from "@/lib/booleanAlgebra";

const Activity3B = () => {
  const navigate = useNavigate();
  const [expression, setExpression] = useState("(A && B) || (!A && C)");
  const [result, setResult] = useState<BooleanResult | null>(null);

  const handleSimulate = () => {
    const analysisResult = analyzeBoolean(expression);
    setResult(analysisResult);
  };

  const handleReset = () => {
    setResult(null);
    setExpression("(A && B) || (!A && C)");
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
            Activity 3B – Logic Circuit Simulation
          </h1>
          <p className="text-muted-foreground">
            Simplify Boolean expressions and generate truth tables
          </p>
        </div>

        <div className="grid gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Boolean Expression</CardTitle>
              <CardDescription>
                Enter a logical expression using: && (AND), || (OR), ! (NOT), and parentheses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Expression</Label>
                <Input
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="(A && B) || (!A && C)"
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSimulate} className="flex-1">
                  Simplify & Simulate
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && result.truthTable.length > 0 && (
            <>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle>Simplified Expression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-md p-4 font-mono text-lg text-center text-primary font-semibold">
                    {result.simplified}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Truth Table</CardTitle>
                  <CardDescription>
                    All possible input combinations and their outputs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-primary">
                          {result.variables.map((variable) => (
                            <th key={variable} className="p-3 text-left font-semibold text-primary">
                              {variable}
                            </th>
                          ))}
                          <th className="p-3 text-left font-semibold text-primary">Output</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.truthTable.map((row, index) => (
                          <tr
                            key={index}
                            className={`border-b ${
                              row.output
                                ? "bg-primary/10 font-semibold"
                                : "bg-background"
                            }`}
                          >
                            {result.variables.map((variable) => (
                              <td key={variable} className="p-3 font-mono">
                                {row.inputs[variable] ? "1" : "0"}
                              </td>
                            ))}
                            <td className={`p-3 font-mono ${row.output ? "text-primary font-bold" : ""}`}>
                              {row.output ? "1" : "0"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Circuit Interpretation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="bg-background rounded-md p-4 space-y-2">
                      <p className="font-semibold text-primary">Expression Analysis:</p>
                      <p className="font-mono">{result.original}</p>
                      <p className="text-muted-foreground mt-2">
                        This circuit has {result.variables.length} input{result.variables.length !== 1 ? 's' : ''} ({result.variables.join(', ')}) 
                        and produces {result.truthTable.filter(row => row.output).length} TRUE output
                        {result.truthTable.filter(row => row.output).length !== 1 ? 's' : ''} out of {result.truthTable.length} possible 
                        input combination{result.truthTable.length !== 1 ? 's' : ''}.
                      </p>
                      {result.simplified !== result.original && (
                        <p className="text-muted-foreground mt-2">
                          The simplified form reduces circuit complexity while maintaining the same logical behavior.
                        </p>
                      )}
                    </div>
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

export default Activity3B;
