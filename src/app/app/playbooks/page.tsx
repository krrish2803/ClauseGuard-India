"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

const clauseTypes = [
  "confidentiality", "data_protection", "sub_processing", "audit_rights",
  "breach_notification", "limitation_of_liability", "indemnity", "termination",
  "dispute_resolution", "governing_law", "ip_ownership", "payment", "sla",
  "non_solicit", "assignment", "warranty",
];

const typeLabels: Record<string, string> = {
  confidentiality: "Confidentiality",
  data_protection: "Data Protection",
  sub_processing: "Sub-Processing",
  audit_rights: "Audit Rights",
  breach_notification: "Breach Notification",
  limitation_of_liability: "Limitation of Liability",
  indemnity: "Indemnity",
  termination: "Termination",
  dispute_resolution: "Dispute Resolution",
  governing_law: "Governing Law",
  ip_ownership: "IP Ownership",
  payment: "Payment",
  sla: "SLA / Service Levels",
  non_solicit: "Non-Solicit",
  assignment: "Assignment",
  warranty: "Warranty",
};

export default function PlaybooksPage() {
  const [activeType, setActiveType] = useState(clauseTypes[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playbooks</h1>
          <p className="text-sm text-muted-foreground">Clause playbook rules for Indian contract review</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card className="border-border/50">
            <div className="p-3 border-b border-border/50">
              <h3 className="text-sm font-semibold">Clause Types</h3>
            </div>
            <ScrollArea className="h-[500px]">
              {clauseTypes.map((type) => (
                <div
                  key={type}
                  className={`p-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 ${activeType === type ? "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500" : ""}`}
                  onClick={() => setActiveType(type)}
                >
                  <p className="text-sm font-medium capitalize">{typeLabels[type]}</p>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>

        <div className="col-span-9">
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold capitalize mb-4">{typeLabels[activeType]} Playbook</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Review this playbook rule for {typeLabels[activeType]} clauses in Indian contracts.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Playbook rules are automatically seeded and loaded from the database during contract review.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
