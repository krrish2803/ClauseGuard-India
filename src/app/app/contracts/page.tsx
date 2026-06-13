"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Plus, File, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    seedAndLoad();
  }, []);

  async function seedAndLoad() {
    // Ensure demo data is seeded
    try {
      await fetch("/api/seed", { method: "POST" });
    } catch {
      // Silent fail
    }
    loadContracts();
  }

  function loadContracts() {
    fetch("/api/contracts")
      .then(r => r.json())
      .then(d => { setContracts(d.contracts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function deleteContract(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this contract and all its reviews?")) return;
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Contract deleted");
        setContracts(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  }

  function openDialog() {
    setTitle("");
    setText("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!title.trim() || !text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), extractedText: text.trim() }),
      });
      const data = await res.json();
      if (data.contract) {
        toast.success("Contract created");
        setDialogOpen(false);
        loadContracts();
      } else {
        toast.error(data.error || "Failed to create contract");
      }
    } catch {
      toast.error("Failed to create contract");
    }
    setSaving(false);
  }

  const statusColor: Record<string, string> = {
    UPLOADING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PARSING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    REVIEWING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    PENDING: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading contracts...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your contracts</p>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={openDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Contract</DialogTitle>
            <DialogDescription>
              Enter the contract title and paste the full agreement text below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Contract Title</label>
              <Input
                placeholder="e.g. Vendor Agreement - Acme Corp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Agreement Text</label>
              <textarea
                className="w-full h-56 rounded-lg border border-border bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Paste the full vendor agreement text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !text.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? "Saving..." : "Save Text"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {contracts.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/50">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No contracts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first contract to start reviewing</p>
          <Button variant="outline" className="mx-auto" onClick={openDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {[...contracts].sort((a, b) => (b.isDemo ? 1 : 0) - (a.isDemo ? 1 : 0)).map((c) => (
            <Link key={c._id} href={`/app/contracts/${c._id}`}>
              <Card className={`p-5 border-border/50 hover:border-amber-200/50 transition-colors cursor-pointer ${c.isDemo ? "border-amber-400/60 bg-amber-50/30 dark:bg-amber-950/10" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                      <File className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{c.title}</h3>
                        {c.isDemo && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-400 text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">
                            DEMO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{c._count?.clauses || 0} clauses</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColor[c.status] || ""} variant="secondary">{c.status}</Badge>
                    <button onClick={(e) => deleteContract(c._id, e)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
