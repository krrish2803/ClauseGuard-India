"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Play,
  ArrowRight,
  Shield,
  Target,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function AppDashboard() {
  const [stats, setStats] = useState({ contracts: 0, risks: 0, reviews: 0 });
  const [demoContractId, setDemoContractId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // Auto-seed demo data on first load, then load stats
    seedAndLoad();
  }, []);

  async function seedAndLoad() {
    // First, ensure demo data is seeded
    try {
      const seedRes = await fetch("/api/seed", { method: "POST" });
      if (seedRes.ok) {
        const seedData = await seedRes.json();
        if (seedData.demoContractId) {
          setDemoContractId(seedData.demoContractId);
        }
      }
    } catch {
      // Silent fail - seed might already exist
    }

    // Then load contract stats
    loadStats();
  }

  function loadStats() {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((d) => {
        if (d.contracts) {
          const highRisk = d.contracts.filter((c: any) =>
            c.clauseReviews?.some((r: any) => r.riskLevel === "HIGH")
          ).length;
          setStats({
            contracts: d.contracts.length,
            risks: highRisk,
            reviews: d.contracts.filter((c: any) => c.status === "COMPLETED").length,
          });

          // Find demo contract ID from list if not set
          const demo = d.contracts.find((c: any) => c.isDemo);
          if (demo && !demoContractId) {
            setDemoContractId(demo._id);
          }
        }
      })
      .catch(() => {});
  }

  async function reseedDemo() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.demoContractId) {
        setDemoContractId(data.demoContractId);
        toast.success("Demo contract ready!");
        loadStats();
      } else {
        toast.error(data.error || "Failed to seed demo");
      }
    } catch {
      toast.error("Failed to seed demo data");
    }
    setSeeding(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome to ClauseGuard India — AI-powered contract review
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/contracts">
            <Button variant="outline" size="sm">
              View Contracts
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Contract Hero Card */}
      {demoContractId ? (
        <Card className="p-6 border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    Demo Contract — Indian MSA
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-amber-400 text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-300 text-xs"
                  >
                    PRE-REVIEWED
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-xl">
                  <span className="font-medium text-foreground">Acme Technologies Pvt Ltd</span>
                  {" vs "}
                  <span className="font-medium text-foreground">Vendor Solutions India Pvt Ltd</span>
                  {" — "}
                  Fully reviewed with 6 clauses analyzed, 4 high-risk flags, and negotiation stances ready.
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-400">4 High Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">2 Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-400">1 Clean</span>
                  </div>
                </div>
              </div>
            </div>
            <Link href={`/app/contracts/${demoContractId}`}>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm gap-2">
                <Eye className="h-4 w-4" />
                View Review
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-dashed border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Demo Contract</h2>
                <p className="text-sm text-muted-foreground">
                  Loading pre-reviewed demo contract...
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={reseedDemo}
              disabled={seeding}
              className="gap-2"
            >
              {seeding ? "Seeding..." : "Load Demo"}
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contracts}</p>
              <p className="text-xs text-muted-foreground">Contracts</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.risks}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reviews}</p>
              <p className="text-xs text-muted-foreground">Reviews Done</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">India</p>
              <p className="text-xs text-muted-foreground">Jurisdiction</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <Upload className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">Upload a Contract</h3>
              <p className="text-xs text-muted-foreground">
                Paste your NDA, MSA, or vendor agreement text
              </p>
            </div>
          </div>
          <Link href="/app/contracts">
            <Button className="w-full" variant="outline">
              Go to Contracts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {demoContractId ? (
          <Card className="p-6 border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Play className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Demo Review</h3>
                <p className="text-xs text-muted-foreground">
                  See ClauseGuard in action — instant results, no waiting
                </p>
              </div>
            </div>
            <Link href={`/app/contracts/${demoContractId}`}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Open Demo Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Play className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Run Demo</h3>
                <p className="text-xs text-muted-foreground">
                  See ClauseGuard in action with sample data
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={reseedDemo}
              disabled={seeding}
            >
              {seeding ? "Loading..." : "Launch Demo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>

      {/* Demo Walkthrough Guide */}
      {demoContractId && (
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Demo Walkthrough Guide
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-sm font-bold text-red-700 dark:text-red-300">
                1
              </div>
              <p className="text-xs font-medium">Click a High Risk clause</p>
              <p className="text-xs text-muted-foreground">
                See evidence citations from Indian law playbooks
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300">
                2
              </div>
              <p className="text-xs font-medium">View Missing Clauses</p>
              <p className="text-xs text-muted-foreground">
                Discover critical gaps like missing DPDP protection
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                3
              </div>
              <p className="text-xs font-medium">Open Negotiation Tab</p>
              <p className="text-xs text-muted-foreground">
                See "Push Hard" talking points and fallback positions
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                4
              </div>
              <p className="text-xs font-medium">Export Report</p>
              <p className="text-xs text-muted-foreground">
                Download the full review as a printable HTML report
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
