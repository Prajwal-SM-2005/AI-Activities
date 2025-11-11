import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Trash2, Play, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PREDEFINED_RULES,
  parseUserInput,
  forwardChaining,
  backwardChaining,
  SmartHomeFact,
  InferenceStep
} from "@/lib/smartHomeLogic";

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  type?: 'fact' | 'inference' | 'explanation' | 'error';
  timestamp: number;
}

const Activity5 = () => {
  const navigate = useNavigate();
  const [facts, setFacts] = useState<Map<string, SmartHomeFact>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: '👋 Welcome to Smart Home Assistant! I use logic reasoning to control your home. Try: "motion detected", "nighttime true", "temperature livingroom 16", or ask "why heater?"',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [newFactKeys, setNewFactKeys] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'bot', content: string, type?: ChatMessage['type']) => {
    setMessages(prev => [...prev, { role, content, type, timestamp: Date.now() }]);
  };

  const handleForwardChaining = () => {
    const steps = forwardChaining(new Map(facts));
    
    if (steps.length === 0) {
      addMessage('bot', '🔍 No new inferences can be made with current facts.', 'explanation');
      return;
    }

    addMessage('bot', '🔁 Running Forward Chaining...', 'explanation');
    
    const newFacts = new Map(facts);
    const inferredKeys = new Set<string>();
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        step.newFacts.forEach(fact => {
          newFacts.set(fact.key, fact);
          inferredKeys.add(fact.key);
        });
        setFacts(new Map(newFacts));
        setNewFactKeys(inferredKeys);
        addMessage('bot', `✅ Inferred: ${step.rule.action}`, 'inference');
        
        // Clear highlight after animation
        if (index === steps.length - 1) {
          setTimeout(() => setNewFactKeys(new Set()), 2000);
        }
      }, index * 500);
    });
  };

  const handleBackwardChaining = (goal: string) => {
    const result = backwardChaining(goal, facts);
    
    addMessage('bot', `🔍 Backward Chaining for "${goal}":`, 'explanation');
    
    result.trace.forEach((line, index) => {
      setTimeout(() => {
        addMessage('bot', line, 'explanation');
      }, index * 300);
    });
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    addMessage('user', input);
    const parsed = parseUserInput(input, facts);

    switch (parsed.type) {
      case 'fact':
        const newFacts = new Map(facts);
        const fact: SmartHomeFact = {
          key: parsed.data.key,
          value: parsed.data.value,
          timestamp: Date.now()
        };
        newFacts.set(parsed.data.key, fact);
        setFacts(newFacts);
        setNewFactKeys(new Set([parsed.data.key]));
        
        addMessage('bot', `✅ Fact added: ${parsed.data.key} = ${parsed.data.value}`, 'fact');
        
        // Auto-run forward chaining
        setTimeout(() => {
          const steps = forwardChaining(new Map(newFacts));
          if (steps.length > 0) {
            const updatedFacts = new Map(newFacts);
            const inferredKeys = new Set<string>();
            
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.newFacts.forEach(f => {
                  updatedFacts.set(f.key, f);
                  inferredKeys.add(f.key);
                });
                setFacts(new Map(updatedFacts));
                setNewFactKeys(inferredKeys);
                addMessage('bot', `✅ Inferred: ${step.rule.action}`, 'inference');
                
                if (index === steps.length - 1) {
                  setTimeout(() => setNewFactKeys(new Set()), 2000);
                }
              }, index * 500);
            });
          }
        }, 500);
        break;

      case 'query':
        handleBackwardChaining(parsed.data);
        break;

      case 'command':
        if (parsed.data === 'forward_chaining') {
          handleForwardChaining();
        } else if (parsed.data === 'clear') {
          setFacts(new Map());
          setMessages([{
            role: 'bot',
            content: '🧹 Facts and chat cleared!',
            timestamp: Date.now()
          }]);
        } else if (parsed.data === 'show_facts') {
          if (facts.size === 0) {
            addMessage('bot', 'No facts available.', 'explanation');
          } else {
            const factList = Array.from(facts.entries())
              .map(([key, fact]) => `${key} = ${fact.value}`)
              .join('\n');
            addMessage('bot', `Current Facts:\n${factList}`, 'explanation');
          }
        }
        break;

      default:
        addMessage('bot', '❓ I didn\'t understand that. Try: "motion detected", "nighttime true", "temperature livingroom 16", or "why heater?"', 'error');
    }

    setInput("");
  };

  const getMessageClass = (msg: ChatMessage) => {
    const base = "p-3 rounded-lg max-w-[80%] animate-fade-in";
    if (msg.role === 'user') {
      return `${base} bg-primary text-primary-foreground ml-auto`;
    }
    
    switch (msg.type) {
      case 'fact':
        return `${base} bg-green-100 dark:bg-green-900/30 text-foreground border border-green-300 dark:border-green-700`;
      case 'inference':
        return `${base} bg-blue-100 dark:bg-blue-900/30 text-foreground border border-blue-300 dark:border-blue-700 animate-scale-in`;
      case 'explanation':
        return `${base} bg-muted text-muted-foreground`;
      case 'error':
        return `${base} bg-destructive/10 text-destructive border border-destructive/30`;
      default:
        return `${base} bg-card text-card-foreground`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-center">🏡 Smart Home Assistant</h1>
          <div className="w-32" />
        </div>

        <p className="text-center text-muted-foreground">Logic-Based Reasoning System</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Facts Dashboard */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">📊 Facts Dashboard</CardTitle>
              <CardDescription>Current known facts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {facts.size === 0 ? (
                    <p className="text-sm text-muted-foreground">No facts yet</p>
                  ) : (
                    Array.from(facts.entries()).map(([key, fact]) => (
                      <Badge
                        key={key}
                        variant={newFactKeys.has(key) ? "default" : "secondary"}
                        className={`w-full justify-start text-xs ${
                          newFactKeys.has(key) ? 'animate-pulse' : ''
                        }`}
                      >
                        {key}: {String(fact.value)}
                      </Badge>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <CardTitle className="text-lg">💬 Chat Assistant</CardTitle>
              <CardDescription>Interact with the reasoning engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={getMessageClass(msg)}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="flex gap-2">
                <Input
                  placeholder="Type a fact or question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button onClick={handleSubmit} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleForwardChaining}>
                  <Play className="mr-2 h-4 w-4" />
                  Forward Chain
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInput("why ")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Explain Why
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFacts(new Map());
                    setMessages([{
                      role: 'bot',
                      content: '🧹 Facts and chat cleared!',
                      timestamp: Date.now()
                    }]);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">📚 Knowledge Base</CardTitle>
              <CardDescription>Pre-loaded rules</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {PREDEFINED_RULES.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border text-xs"
                    >
                      <div className="font-semibold text-primary mb-1">Rule {rule.id}</div>
                      <div className="text-muted-foreground">{rule.raw}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Activity5;
