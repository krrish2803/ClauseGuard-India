"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProgressEvent } from "@/lib/types";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewProgressProps {
  contractId: string;
  open: boolean;
  onComplete: () => void;
  onError: (message: string) => void;
}

const AGENTS: { id: string; label: string }[] = [
  { id: "ingestion", label: "Ingesting contract" },
  { id: "segmentation", label: "Segmenting clauses" },
  { id: "classification", label: "Classifying clauses" },
  { id: "clause_review", label: "Reviewing clauses" },
  { id: "review_composer", label: "Composing final review" },
];

export default function ReviewProgress({ contractId, open, onComplete, onError }: ReviewProgressProps) {
  const [agentStates, setAgentStates] = useState<Record<string, ProgressEvent["status"]>>({});
  const [currentMessage, setCurrentMessage] = useState("Starting review...");
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [errored, setErrored] = useState(false);
  const doneRef = useRef(false);
  const erroredRef = useRef(false);

  useEffect(() => {
    if (!open || !contractId) return;

    doneRef.current = false;
    erroredRef.current = false;

    const es = new EventSource(`/api/reviews/stream?contractId=${contractId}`);

    es.addEventListener("progress", (e: Event) => {
      const msg = e as MessageEvent;
      const event: ProgressEvent = JSON.parse(msg.data);
      setAgentStates(prev => ({ ...prev, [event.agent]: event.status }));
      if (event.status === "running") {
        setCurrentAgent(event.agent);
        setCurrentMessage(event.label);
      } else if (event.status === "completed") {
        if (event.current && event.total) {
          setCurrentMessage(`${event.label} (${event.current}/${event.total})`);
        }
      }
    });

    es.addEventListener("done", (_e: Event) => {
      doneRef.current = true;
      setDone(true);
      setCurrentMessage("Review complete!");
      es.close();
    });

    es.addEventListener("review_error", (e: Event) => {
      const msg = e as MessageEvent;
      const data = msg.data ? JSON.parse(msg.data) : { message: "Review failed" };
      erroredRef.current = true;
      setErrored(true);
      setCurrentMessage(data.message || "Review failed");
      onError(data.message || "Review failed");
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED && !doneRef.current && !erroredRef.current) {
        erroredRef.current = true;
        setErrored(true);
        setCurrentMessage("Connection lost");
        onError("Connection lost");
      }
    };

    return () => {
      es.close();
    };
  }, [open, contractId, onError]);

  const statusIcon = (status?: ProgressEvent["status"]) => {
    switch (status) {
      case "running": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground/40" />;
    }
  };

  const completedCount = Object.values(agentStates).filter(s => s === "completed" || s === "failed").length;
  const totalSteps = AGENTS.length;
  const progressPct = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) onComplete(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Reviewing Contract</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${errored ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground">{currentMessage}</p>

          <div className="space-y-1">
            {AGENTS.map((agent) => {
              const state = agentStates[agent.id];
              const isActive = currentAgent === agent.id && state === "running";
              return (
                <div
                  key={agent.id}
                  className={`flex items-center gap-3 py-1.5 px-2 rounded-md text-sm ${isActive ? "bg-muted" : ""}`}
                >
                  {statusIcon(state)}
                  <span className={`${state === "completed" ? "text-foreground" : state === "running" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {agent.label}
                  </span>
                  {isActive && <span className="ml-auto text-xs text-blue-500">Processing...</span>}
                  {state === "completed" && <span className="ml-auto text-xs text-green-500">Done</span>}
                </div>
              );
            })}
          </div>
        </div>
        {done && (
          <div className="flex justify-end pt-2">
            <Button onClick={onComplete} className="bg-amber-600 hover:bg-amber-700 text-white">
              View Results
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
