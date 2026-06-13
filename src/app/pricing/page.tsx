import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "For individual legal professionals",
    features: ["5 contracts/month", "Basic AI review", "Clause classification", "Risk scoring", "Email support"],
  },
  {
    name: "Professional",
    price: "\u20B92,499",
    period: "/month",
    description: "For legal teams and startups",
    features: ["50 contracts/month", "Full agent pipeline", "Verifier-grounded redlining", "Negotiation Coach", "Playbook access", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For law firms and enterprises",
    features: ["Unlimited contracts", "Custom playbooks", "API access", "SSO/SAML", "Dedicated success manager", "SLA guarantee", "On-premise option"],
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-4 border-amber-200 text-amber-700">Pricing</Badge>
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Start free, scale as your contract review needs grow.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`p-8 border-border/50 text-left relative ${tier.popular ? "border-amber-200 shadow-md" : ""}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="mt-3 mb-1">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.name === "Starter" ? "/app" : "/demo"}>
                    <Button className={`w-full ${tier.popular ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`} variant={tier.popular ? "default" : "outline"}>
                      {tier.name === "Starter" ? "Get Started" : "Contact Sales"}
                    </Button>
                  </Link>
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
