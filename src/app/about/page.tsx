import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, Target, Brain } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 border-b border-border/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-amber-200 text-amber-700">About</Badge>
              <h1 className="text-4xl font-bold mb-4">Built for Indian Contracts</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ClauseGuard India brings AI-powered contract review specifically designed for the Indian legal and business landscape.
              </p>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-6">
                Indian commercial contracts present unique challenges. From DPDP Act compliance and liability carve-outs 
                that follow Indian Contract Act principles, to arbitration clauses that must carefully distinguish between 
                seat and governing law — reviewing Indian contracts requires domain-specific expertise.
              </p>
              <p className="text-muted-foreground mb-6">
                ClauseGuard India uses a pipeline of specialized AI agents to review contracts clause by clause. 
                Each agent handles a specific task: classifying clauses, retrieving relevant precedent and playbook 
                guidance, assessing risk under Indian law, drafting evidence-backed redlines, and providing negotiation 
                strategy.
              </p>
              <p className="text-muted-foreground mb-6">
                The Verifier Agent is our key innovation — it independently checks every redline against retrieved 
                evidence, ensuring no fabricated legal basis reaches the final review. If support is insufficient, 
                the verifier rejects the suggestion and triggers a refined re-retrieval.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-12">
              {[
                { icon: Scale, value: "India-First", label: "Domain expertise" },
                { icon: Shield, value: "Verifier", label: "Grounded AI outputs" },
                { icon: Target, value: "Negotiation", label: "Actionable strategy" },
                { icon: Brain, value: "Multi-Agent", label: "Modular pipeline" },
              ].map((item) => (
                <Card key={item.value} className="p-4 border-border/50 text-center">
                  <item.icon className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
