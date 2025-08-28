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
import {
  Bot,
  Play,
  CheckCircle,
  Info,
  XCircle,
  Camera,
  Wifi,
  Heart,
  Clock,
  User,
  Terminal,
  Linkedin,
  Twitter,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

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

  const getLogTypeConfig = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
          iconColor: "text-green-600 dark:text-green-400",
          badgeVariant: "default" as const,
        };
      case "error":
        return {
          icon: XCircle,
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
          iconColor: "text-red-600 dark:text-red-400",
          badgeVariant: "destructive" as const,
        };
      case "screenshot":
        return {
          icon: Camera,
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
          iconColor: "text-purple-600 dark:text-purple-400",
          badgeVariant: "secondary" as const,
        };
      case "connected":
        return {
          icon: Wifi,
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          badgeVariant: "outline" as const,
        };
      case "heartbeat":
        return {
          icon: Heart,
          bgColor: "bg-pink-50 dark:bg-pink-950/20",
          borderColor: "border-pink-200 dark:border-pink-800",
          iconColor: "text-pink-600 dark:text-pink-400",
          badgeVariant: "outline" as const,
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          badgeVariant: "outline" as const,
        };
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Browser Automation
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Automate web interactions using AI agents powered by OpenAI and
          Playwright.
        </p>

        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-white">
            OPENAPI KEY NOT AVAILABLE IN PRODUCTION
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Setup locally & read docs from:
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="https://github.com/BCAPATHSHALA/AI-BROWSER-AUTOMATION-TOOL"
            target="_blank"
          >
            <Badge variant="secondary">Github</Badge>
          </Link>

          <span className="text-sm font-medium text-muted-foreground">
            Follow us:
          </span>

          <Link href="https://linkedin.com/in/manojofficialmj" target="_blank">
            <Badge variant="outline" className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" /> /in/manojofficialmj
            </Badge>
          </Link>

          <Link href="https://x.com/manojofficialmj" target="_blank">
            <Badge variant="outline" className="flex items-center gap-1">
              <Twitter className="h-4 w-4" /> /manojofficialmj
            </Badge>
          </Link>
        </div>
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
                placeholder="Example: Go to 10xtechinfinity.in and fill out the contact form with name 'Manoj Kumar' and email 'contact@10xtechinfinity.in'"
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
              <Terminal className="h-5 w-5" />
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
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Terminal className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    No logs yet...
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">
                    Start an automation to see logs here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const config = getLogTypeConfig(log.type);
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border transition-all hover:shadow-sm ${config.bgColor} ${config.borderColor}`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className={`h-4 w-4 ${config.iconColor}`}
                            />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.timestamp}
                            </span>
                          </div>
                          <Badge
                            variant={config.badgeVariant}
                            className="text-xs"
                          >
                            {log.type.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Message */}
                        <p className="font-medium text-sm mb-3 leading-relaxed">
                          {log.message}
                        </p>

                        {/* Last Agent */}
                        {log.data?.lastAgent && (
                          <div className="flex items-center gap-2 mb-3 p-2 bg-background/50 rounded-md">
                            <User className="h-3 w-3 text-blue-600" />
                            <span className="text-xs">
                              <strong className="text-blue-600">
                                Active Agent:
                              </strong>{" "}
                              <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded text-blue-700 dark:text-blue-300">
                                {log.data.lastAgent}
                              </code>
                            </span>
                          </div>
                        )}

                        {/* Final Output */}
                        {log.data?.finalOutput && (
                          <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <strong className="text-xs text-green-700 dark:text-green-300">
                                Final Output:
                              </strong>
                            </div>
                            <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                              {log.data.finalOutput}
                            </p>
                          </div>
                        )}

                        {/* Full History */}
                        {log.data?.history && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 flex items-center gap-1 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md transition-colors">
                              <Terminal className="h-3 w-3" />
                              Show execution history ({
                                log.data.history.length
                              }{" "}
                              steps)
                            </summary>
                            <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                              {log.data.history.map((h: any, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 bg-background border rounded-md text-xs space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                        Step {i + 1}
                                      </span>
                                      {h.type && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {h.type}
                                        </Badge>
                                      )}
                                    </div>
                                    {h.status && (
                                      <Badge
                                        variant={
                                          h.status === "success"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {h.status}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-2">
                                    {h.role && (
                                      <div>
                                        <strong className="text-muted-foreground">
                                          Role:
                                        </strong>{" "}
                                        <code className="bg-muted px-1 py-0.5 rounded">
                                          {h.role}
                                        </code>
                                      </div>
                                    )}
                                    {h.name && (
                                      <div>
                                        <strong className="text-muted-foreground">
                                          Name:
                                        </strong>{" "}
                                        <code className="bg-muted px-1 py-0.5 rounded">
                                          {h.name}
                                        </code>
                                      </div>
                                    )}
                                    {h.callId && (
                                      <div>
                                        <strong className="text-muted-foreground">
                                          Call ID:
                                        </strong>{" "}
                                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                          {h.callId}
                                        </code>
                                      </div>
                                    )}
                                  </div>

                                  {h.arguments && (
                                    <div>
                                      <strong className="text-muted-foreground block mb-1">
                                        Arguments:
                                      </strong>
                                      <pre className="bg-muted/50 border rounded p-2 text-xs whitespace-pre-wrap break-all overflow-x-auto">
                                        {h.arguments}
                                      </pre>
                                    </div>
                                  )}
                                  {h.content && (
                                    <div>
                                      <strong className="text-muted-foreground block mb-1">
                                        Content:
                                      </strong>
                                      <pre className="bg-muted/50 border rounded p-2 text-xs whitespace-pre-wrap break-all overflow-x-auto">
                                        {typeof h.content === "string"
                                          ? h.content
                                          : JSON.stringify(h.content, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {h.output && (
                                    <div>
                                      <strong className="text-muted-foreground block mb-1">
                                        Output:
                                      </strong>
                                      <pre className="bg-muted/50 border rounded p-2 text-xs whitespace-pre-wrap break-all overflow-x-auto">
                                        {typeof h.output === "string"
                                          ? h.output
                                          : JSON.stringify(h.output, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Screenshot */}
                        {log.screenshot && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Camera className="h-3 w-3 text-purple-600" />
                              <strong className="text-xs text-purple-700 dark:text-purple-300">
                                Screenshot Captured
                              </strong>
                            </div>
                            <div className="space-y-2">
                              <a
                                href={log.screenshot.replace(
                                  "Screenshot URL: ",
                                  ""
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                >
                                  <Camera className="h-3 w-3 mr-1" />
                                  View Full Screenshot
                                </Badge>
                              </a>
                              <img
                                src={
                                  log.screenshot.replace(
                                    "Screenshot URL: ",
                                    ""
                                  ) || "/placeholder.svg"
                                }
                                alt="Automation screenshot"
                                className="rounded border max-h-48 w-full object-contain bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
