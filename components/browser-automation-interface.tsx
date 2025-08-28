"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Play, Square, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface AutomationLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "screenshot" | "connected" | "heartbeat";
  message: string;
  screenshot?: string;
  data?: any;
}

export function BrowserAutomationInterface() {
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  const handleStartAutomation = async () => {
    if (!prompt.trim()) return;

    setIsRunning(true);
    setLogs([]);

    try {
      const response = await apiClient.startAutomation(prompt);

      if (response.success) {
        // Add initial log: history: any; lastAgent?: string; response: any
        setLogs([
          {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type: "info",
            message: (response.data as { message: string }).message,
            data: response.data as Record<string, unknown>,
          },
        ]);
      } else {
        throw new Error(response.error || "Failed to start automation");
      }
    } catch (error) {
      console.error("Automation error:", error);
      setLogs([
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: "error",
          message: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  console.log("LOGS::::", logs);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-balance mb-2">
          AI Browser Automation
        </h1>
        <p className="text-muted-foreground text-lg">
          Automate web interactions using AI agents powered by OpenAI and
          Playwright
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Automation Control
            </CardTitle>
            <CardDescription>
              Describe what you want the AI agent to do on the web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Automation Prompt
              </label>
              <Textarea
                id="prompt"
                placeholder="Example: Go to example.com and fill out the contact form with name 'John Doe' and email 'john@example.com'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={isRunning}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStartAutomation}
                disabled={isRunning || !prompt.trim()}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Running..." : "Start Automation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status & Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Automation Logs
              {logs.length > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {logs.length} {logs.length === 1 ? "log" : "logs"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time updates from the AI agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 space-y-4 pr-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No logs yet...</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-card text-sm space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp}
                      </span>
                      <Badge
                        variant={
                          log.type === "error"
                            ? "destructive"
                            : log.type === "success"
                            ? "default"
                            : "outline"
                        }
                      >
                        {log.type}
                      </Badge>
                    </div>

                    {/* Message */}
                    <p className="font-medium">{log.message}</p>

                    {/* Last Agent */}
                    {log.data?.lastAgent && (
                      <p className="text-xs">
                        <strong className="text-blue-600">Last Agent:</strong>{" "}
                        {log.data.lastAgent}
                      </p>
                    )}

                    {/* Final Output */}
                    {log.data?.finalOutput && (
                      <div className="text-xs bg-muted p-2 rounded-md">
                        <strong>Final Output:</strong> {log.data.finalOutput}
                      </div>
                    )}

                    {/* Full History */}
                    {log.data?.history && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-blue-600">
                          Show full history ({log.data.history.length} steps)
                        </summary>
                        <div className="mt-2 space-y-3 text-xs bg-muted p-3 rounded-md">
                          {log.data.history.map((h: any, i: number) => (
                            <div
                              key={i}
                              className="border-b pb-2 last:border-0 last:pb-0"
                            >
                              <p>
                                <strong>Type:</strong> {h.type}
                              </p>
                              {h.role && (
                                <p>
                                  <strong>Role:</strong> {h.role}
                                </p>
                              )}
                              {h.name && (
                                <p>
                                  <strong>Name:</strong> {h.name}
                                </p>
                              )}
                              {h.status && (
                                <p>
                                  <strong>Status:</strong> {h.status}
                                </p>
                              )}
                              {h.callId && (
                                <p>
                                  <strong>Call ID:</strong> {h.callId}
                                </p>
                              )}
                              {h.arguments && (
                                <pre className="bg-background border rounded p-2 mt-1 whitespace-pre-wrap break-all">
                                  {h.arguments}
                                </pre>
                              )}
                              {h.content && (
                                <pre className="bg-background border rounded p-2 mt-1 whitespace-pre-wrap break-all">
                                  {typeof h.content === "string"
                                    ? h.content
                                    : JSON.stringify(h.content, null, 2)}
                                </pre>
                              )}
                              {h.output && (
                                <pre className="bg-background border rounded p-2 mt-1 whitespace-pre-wrap break-all">
                                  {typeof h.output === "string"
                                    ? h.output
                                    : JSON.stringify(h.output, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Screenshot if any */}
                    {log.screenshot && (
                      <img
                        src={log.screenshot}
                        alt="screenshot"
                        className="mt-2 rounded border"
                      />
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
