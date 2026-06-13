"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, CheckCircle, XCircle, Clock, ChevronRight, Activity } from "lucide-react";

export default function AgentDebugPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agent")
      .then(r => r.json())
      .then(d => setRuns(d.runs || []))
      .catch(() => {});
  }, []);

  const statusIcons: Record<string, React.ReactNode> = {
    COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
    FAILED: <XCircle className="h-4 w-4 text-red-500" />,
    RUNNING: <Activity className="h-4 w-4 text-blue-500 animate-spin" />,
    PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bug className="h-5 w-5 text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Traces</h1>
          <p className="text-sm text-muted-foreground">Debug view showing agent run timeline</p>
        </div>
      </div>

      {runs.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/50">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No agent runs yet. Upload and review a contract first.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const runId = run._id?.toString() || run.id;
            return (
              <Card key={runId} className="border-border/50 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === runId ? null : runId)}
              >
                <div className="flex items-center gap-3">
                  {statusIcons[run.status] || <Clock className="h-4 w-4" />}
                  <div>
                    <p className="text-sm font-medium capitalize">{run.agentName} Agent</p>
                    <p className="text-xs text-muted-foreground">
                      {run.createdAt && new Date(run.createdAt).toLocaleString()}
                      {run.completedAt && ` — took ${Math.round((new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{run.status}</Badge>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === runId ? "rotate-90" : ""}`} />
                </div>
              </div>

              {expanded === runId && (
                <div className="border-t border-border/50 p-4 space-y-3">
                  {run.steps?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">Steps</h4>
                      <div className="space-y-2">
                        {run.steps.map((step: any) => {
                          const stepId = step._id?.toString() || step.id;
                          return (
                            <div key={stepId} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                              {statusIcons[step.status] || <Clock className="h-3 w-3 mt-0.5" />}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{step.stepName}</p>
                                {step.output && <p className="text-[10px] text-muted-foreground mt-0.5">{step.output.substring(0, 200)}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {run.inputJson && (
                      <div>
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Input</h4>
                        <pre className="text-[10px] bg-muted/30 p-2 rounded max-h-32 overflow-y-auto">{JSON.stringify(JSON.parse(run.inputJson), null, 2)}</pre>
                      </div>
                    )}
                    {run.outputJson && (
                      <div>
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Output</h4>
                        <pre className="text-[10px] bg-muted/30 p-2 rounded max-h-32 overflow-y-auto">{JSON.stringify(JSON.parse(run.outputJson), null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  {run.error && (
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600">Error: {run.error}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
