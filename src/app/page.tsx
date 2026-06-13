import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Scale, Shield, Search, FileCheck, Brain, Target, FileText,
  ArrowRight, ChevronRight, CheckCircle,
  BookOpen, Gavel, AlertTriangle, Users, Building2,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-background to-background dark:from-amber-950/20" />
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-6 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                AI Contract Review Built for India
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                AI Contract Review{" "}
                <span className="text-amber-600">Built for India</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                Upload NDAs, MSAs, and vendor agreements. Get evidence-backed redlines, 
                India-aware risk review, and negotiation strategy in minutes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/demo">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8">
                    Try Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app">
                  <Button size="lg" variant="outline" className="px-8">
                    View Workflow
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="border-b border-border/50 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-medium text-muted-foreground text-center mb-6 uppercase tracking-wider">
              Built for legal teams, procurement, and GCs at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-muted-foreground/60">
              {["Indian Startups", "Law Firms", "Enterprise Legal", "Procurement Teams", "GC Offices"].map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Core Features */}
        <section className="py-20 md:py-28 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Review Indian Contracts with Confidence</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Review Indian contracts, generate evidence-backed redlines, and know which clauses to negotiate hard.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-border/50 hover:border-amber-200/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-5">
                  <Gavel className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">India-Aware Clause Review</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  DPDP Act 2023 compliance checks. Indian arbitration and jurisdiction analysis. 
                  Liability caps, indemnity, and carve-out evaluation per Indian market standards.
                </p>
              </Card>

              <Card className="p-8 border-border/50 hover:border-amber-200/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-5">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Verifier-Grounded Redlining</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every redline is independently verified against retrieved evidence. 
                  Unsupported claims are rejected and re-retrieved before approval.
                </p>
              </Card>

              <Card className="p-8 border-border/50 hover:border-amber-200/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-5">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Negotiation Coach Agent</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each clause labeled Push Hard, Negotiable, or Standard. Get talking points, 
                  fallback positions, and business impact analysis for every negotiation.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How the Agents Work</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A pipeline of specialized AI agents working together to review your contract.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Ingest & Segment", desc: "Parse PDF/DOCX, detect title, parties, dates. Split into clause-level units with headings and offsets.", icon: FileText },
                { step: "02", title: "Classify & Retrieve", desc: "Classify each clause type. Retrieve precedent snippets, playbook rules, and approved fallback language.", icon: Search },
                { step: "03", title: "Review & Redline", desc: "Risk score each clause. Draft evidence-backed redlines grounded in Indian legal standards.", icon: FileCheck },
                { step: "04", title: "Verify", desc: "Independent verifier checks every redline against evidence. Rejects unsupported claims, triggers re-retrieval.", icon: Shield },
                { step: "05", title: "Coach", desc: "Assign negotiation stance. Generate talking points, fallback positions, and business impact notes.", icon: Brain },
                { step: "06", title: "Compose", desc: "Assemble executive summary with top risks, priority redlines, and negotiation strategy.", icon: BookOpen },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-6 rounded-lg border border-border/50 hover:border-amber-200/50 transition-colors">
                  <span className="text-2xl font-bold text-amber-600/30">{item.step}</span>
                  <div>
                    <item.icon className="h-4 w-4 text-amber-600 mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Indian Contracts */}
        <section className="py-20 md:py-28 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Indian Contracts</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Indian commercial contracts need careful handling of specific provisions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "DPDP-Sensitive Obligations", desc: "Digital Personal Data Protection Act, 2023 compliance checks with penalty exposure analysis." },
                { icon: AlertTriangle, title: "Breach Notification", desc: "72-hour notification requirements, DPDP Board reporting, and data principal notification obligations." },
                { icon: Search, title: "Audit Rights", desc: "Frequency, scope, cost allocation, and sub-processor audit access under Indian law." },
                { icon: Users, title: "Sub-Processor Controls", desc: "Consent requirements, liability flow-down, right to object, and approved sub-processor lists." },
                { icon: FileText, title: "Retention & Deletion", desc: "Data retention schedules, purpose limitation, and mandatory deletion under DPDP Act Section 8." },
                { icon: Shield, title: "Indemnity & Liability", desc: "Indian Contract Act analysis, liability cap reasonableness, and data breach indemnity expectations." },
                { icon: Gavel, title: "Arbitration & Jurisdiction", desc: "Seat vs. governing law distinction, Arbitration Act 1996 compliance, enforceability." },
                { icon: Scale, title: "Jurisdiction Trends", desc: "Indian courts' narrowing stance on foreign governing law in India-centric contracts." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-lg border border-border/50">
                    <Icon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Agent Architecture */}
        <section className="py-20 md:py-28 border-b border-border/50 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Agent Architecture</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Modular agent pipeline with independent verification — no black boxes.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {["Ingestion", "Segmentation", "Classification", "Retrieval", "Risk Review", "Redline", "Verifier", "Coach", "Composer"].map((agent, i) => (
                <div key={agent} className="flex items-center gap-1">
                  <div className="px-4 py-2 rounded-lg bg-background border border-border/50 text-sm font-medium">
                    {agent}
                  </div>
                  {i < 8 && <ChevronRight className="h-4 w-4 text-amber-600" />}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Card className="inline-block p-8 border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/20">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Contextual Fidelity Under Stress</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  The Verifier Agent independently checks every redline against retrieved evidence. If support is insufficient, 
                  it rejects the suggestion and triggers a refined re-retrieval — ensuring no fabricated legal basis reaches the final review. 
                  This verifier loop is fully visible in the UI.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Review Indian Contracts with AI?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your first contract in seconds. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/demo">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8">
                  Try Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app">
                <Button size="lg" variant="outline" className="px-8">
                  Go to App
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
