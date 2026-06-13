"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Shield, AlertTriangle, Target, CheckCircle, XCircle,
  RefreshCw, ChevronRight, Clock, BookOpen, Gavel, Scale,
  ArrowLeft, Zap,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import ReviewProgress from "@/components/review-progress";

const clauseTypeIcons: Record<string, React.ReactNode> = {
  confidentiality: <Shield className="h-3.5 w-3.5" />,
  data_protection: <Shield className="h-3.5 w-3.5" />,
  sub_processing: <UsersIcon className="h-3.5 w-3.5" />,
  audit_rights: <SearchIcon className="h-3.5 w-3.5" />,
  breach_notification: <AlertTriangle className="h-3.5 w-3.5" />,
  limitation_of_liability: <Scale className="h-3.5 w-3.5" />,
  indemnity: <Shield className="h-3.5 w-3.5" />,
  termination: <XCircle className="h-3.5 w-3.5" />,
  dispute_resolution: <Gavel className="h-3.5 w-3.5" />,
  governing_law: <Scale className="h-3.5 w-3.5" />,
};

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export default function ContractReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contract, setContract] = useState<any>(null);
  const [selectedClause, setSelectedClause] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [contractText, setContractText] = useState("");
  const [savingText, setSavingText] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  useEffect(() => { if (id) loadContract(); }, [id]);

  async function loadContract() {
    try {
      const res = await fetch(`/api/contracts/${id}`);
      const data = await res.json();
      setContract(data.contract);

      if (data.contract?.clauses?.length > 0) {
        const first = data.contract.clauses[0];
        setSelectedClause(first);
        const review = data.contract.clauseReviews?.find((r: any) => r.clauseId === first.id);
        setSelectedReview(review);
      }
    } catch { toast.error("Failed to load contract"); }
  }

  async function saveContractText() {
    setSavingText(true);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: contractText }),
      });
      if (res.ok) {
        toast.success("Contract text saved");
        await loadContract();
      } else {
        toast.error("Failed to save text");
      }
    } catch {
      toast.error("Failed to save text");
    }
    setSavingText(false);
  }

  async function exportReport() {
    setExporting(true);
    try {
      const c = contract;
      const reviews = c.clauseReviews || [];
      const missingClauses = c.missingClauses || [];
      const agentRuns = c.agentRuns || [];
      const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const totalClauses = c.clauses?.length || 0;
      const highRisk = reviews.filter((r: any) => r.riskLevel === "HIGH").length;
      const midRisk = reviews.filter((r: any) => r.riskLevel === "MEDIUM").length;
      const lowRisk = reviews.filter((r: any) => r.riskLevel === "LOW").length;
      const clean = totalClauses - highRisk - midRisk;
      const overallRisk = highRisk > 0 ? "HIGH" : midRisk > 2 ? "MEDIUM" : "LOW";
      const overallColor = overallRisk === "HIGH" ? "#dc2626" : overallRisk === "MEDIUM" ? "#d97706" : "#16a34a";
      const reportId = `CG-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      const stanceLabel = (s: string) => s === "PUSH_HARD" ? "PUSH HARD" : s === "NEGOTIABLE" ? "NEGOTIABLE" : "STANDARD";
      const stanceColor = (s: string) => s === "PUSH_HARD" ? "#dc2626" : s === "NEGOTIABLE" ? "#d97706" : "#16a34a";
      const clauseTypeName = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

      // Detect parties from contract text
      const text = c.extractedText || "";
      const partyMatch = text.match(/between[:\s]+([A-Z][\w\s]+?(?:Pvt\s*Ltd|Ltd|Inc|LLC|Corp))/i);
      const andMatch = text.match(/AND\s*\n*\s*([A-Z][\w\s]+?(?:Pvt\s*Ltd|Ltd|Inc|LLC|Corp))/i);
      const party1 = partyMatch?.[1]?.trim() || "Party A";
      const party2 = andMatch?.[1]?.trim() || "Party B";

      // Build summary text
      const topRisks = reviews.filter((r: any) => r.riskLevel === "HIGH").map((r: any) => {
        const cl = c.clauses?.find((c2: any) => c2.id === r.clauseId || c2._id === r.clauseId);
        return cl?.heading || clauseTypeName(r.clauseType || "clause");
      });
      const missingNames = missingClauses.map((m: any) => clauseTypeName(m.clauseType));
      let summaryText = `This contract has ${highRisk} high-risk clause${highRisk !== 1 ? "s" : ""}`;
      if (topRisks.length > 0) summaryText += ` including ${topRisks.slice(0, 3).join(", ")}`;
      summaryText += ".";
      if (missingClauses.length > 0) {
        summaryText += ` ${missingClauses.length} critical clause${missingClauses.length !== 1 ? "s are" : " is"} completely absent including ${missingNames.slice(0, 2).join(" and ")}.`;
      }
      summaryText += ` Recommend legal review before signing.`;

      // Build risk breakdown table
      let riskBreakdownHtml = `<table class="breakdown-table"><thead><tr><th>Clause</th><th>Risk</th><th>Key Issue</th></tr></thead><tbody>`;
      const sortedReviews = [...reviews]
        .filter((r: any) => r.riskLevel === "HIGH" || r.riskLevel === "MEDIUM")
        .sort((a: any, b: any) => {
          const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return (order[a.riskLevel] || 2) - (order[b.riskLevel] || 2);
        });
      sortedReviews.slice(0, 8).forEach((review: any) => {
        const clause = c.clauses?.find((cl: any) => cl.id === review.clauseId || cl._id === review.clauseId);
        const label = clause?.heading || clauseTypeName(clause?.clauseType || "Untitled");
        const riskColor = review.riskLevel === "HIGH" ? "#dc2626" : "#d97706";
        const issue = (review.summary || "").slice(0, 120) + (review.summary?.length > 120 ? "..." : "");
        riskBreakdownHtml += `<tr><td class="breakdown-clause">${label}</td><td><span class="risk-badge" style="background:${riskColor};font-size:9px;padding:2px 8px">${review.riskLevel}</span></td><td class="breakdown-issue">${issue}</td></tr>`;
      });
      riskBreakdownHtml += `</tbody></table>`;

      // Build key observations
      const observations: string[] = [];
      if (highRisk >= 3) observations.push(`Contract has ${highRisk} high-risk clauses requiring immediate attention before signing.`);
      else if (highRisk > 0) observations.push(`${highRisk} high-risk clause${highRisk > 1 ? "s" : ""} identified that should be negotiated.`);
      if (missingClauses.length > 0) observations.push(`${missingClauses.length} critical clause${missingClauses.length > 1 ? "s are" : " is"} completely missing from the agreement.`);
      const pushHardCount = reviews.filter((r: any) => r.negotiationRecommendations?.[0]?.stance === "PUSH_HARD").length;
      if (pushHardCount > 0) observations.push(`${pushHardCount} clause${pushHardCount > 1 ? "s" : ""} flagged as non-negotiable — push hard for changes.`);
      if (c.jurisdictionGuess && c.jurisdictionGuess !== "India") observations.push(`Governing law is ${c.jurisdictionGuess} — should be India for domestic contracts.`);
      observations.push(`All redlines have been verified by the independent AI verifier agent.`);
      let observationsHtml = observations.map(o => `<li>${o}</li>`).join("\n");

      // --- MISSING CLAUSES PAGE ---
      let missingHtml = "";
      if (missingClauses.length > 0) {
        missingHtml = `<div class="page">\n<h2 class="page-title">Missing Clauses</h2>\n<p class="page-subtitle">These critical clauses are absent from the contract and represent the highest priority gaps that must be addressed before signing.</p>\n`;
        missingClauses.forEach((m: any, i: number) => {
          missingHtml += `
<div class="missing-clause">
  <div class="missing-header">
    <span class="risk-badge missing-badge">MISSING</span>
    <h3>${clauseTypeName(m.clauseType)}</h3>
  </div>
  <div class="section">
    <div class="section-label">Why It Matters</div>
    <p>${m.indiaNote || m.redFlags || "This clause is essential for protecting your interests under Indian law."}</p>
  </div>
  ${m.redFlags ? `
  <div class="section red-flags-section">
    <div class="section-label">Red Flags If Absent</div>
    <p>${m.redFlags}</p>
  </div>` : ""}
  ${m.mustHaveTerms ? `
  <div class="section must-have-section">
    <div class="section-label">Must-Have Terms</div>
    <p>${m.mustHaveTerms}</p>
  </div>` : ""}
  <div class="section recommended-text">
    <div class="section-label">Recommended Text to Add</div>
    <p class="quote">${m.sampleApprovedWording || m.preferredLanguage || ""}</p>
  </div>
</div>`;
        });
        missingHtml += `</div>`;
      }

      // --- CLAUSE-BY-CLAUSE PAGES (High -> Medium -> Low, skip LOW) ---
      const flaggedReviews = reviews
        .filter((r: any) => r.riskLevel === "HIGH" || r.riskLevel === "MEDIUM")
        .sort((a: any, b: any) => {
          const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return (order[a.riskLevel] || 2) - (order[b.riskLevel] || 2);
        });

      let clausesHtml = "";
      flaggedReviews.forEach((review: any, i: number) => {
        const clause = c.clauses?.find((cl: any) => cl.id === review.clauseId || cl._id === review.clauseId);
        const redline = review.redlineSuggestions?.[0];
        const evidence = review.evidenceSources?.[0];
        const negotiation = review.negotiationRecommendations?.[0];
        const riskColor = review.riskLevel === "HIGH" ? "#dc2626" : "#d97706";
        const clauseLabel = clause?.heading || clauseTypeName(clause?.clauseType || review.clauseType || "Untitled");

        clausesHtml += `
<div class="clause">
  <div class="clause-header">
    <span class="clause-number">CLAUSE ${i + 1}</span>
    <span class="clause-title">${clauseLabel}</span>
    <span class="risk-badge" style="background:${riskColor};margin-left:auto">${review.riskLevel} RISK</span>
  </div>
  <div class="divider"></div>

  <div class="section">
    <div class="section-label">Original Text</div>
    <p class="quote">${clause?.text || "Not available"}</p>
  </div>

  <div class="section">
    <div class="section-label">What&rsquo;s Wrong</div>
    <p>${review.summary || "No summary available."}</p>
    ${review.indiaAngle ? `<p style="margin-top:6px"><strong>India Angle:</strong> ${review.indiaAngle}</p>` : ""}
  </div>

  ${redline ? `
  <div class="section redline-section">
    <div class="section-label">Suggested Redline</div>
    <p class="quote">${redline.suggestedText || ""}</p>
    ${redline.rationale ? `<p class="rationale">${redline.rationale}</p>` : ""}
  </div>` : ""}

  ${evidence ? `
  <div class="section evidence-section">
    <div class="section-label">Evidence Source</div>
    <p><strong>${evidence.title || ""}</strong>${evidence.ruleName ? " &middot; " + evidence.ruleName : ""}</p>
    ${evidence.preferredLanguage ? `<p class="preferred">Preferred language: ${evidence.preferredLanguage}</p>` : ""}
  </div>` : ""}

  ${negotiation ? `
  <div class="section negotiation-section">
    <div class="negotiation-header">
      <span class="section-label">Negotiation Stance</span>
      <span class="stance-badge" style="background:${stanceColor(negotiation.stance)}">${stanceLabel(negotiation.stance)}</span>
    </div>
    ${negotiation.talkingPoint ? `<p><strong>Talking point:</strong> &ldquo;${negotiation.talkingPoint}&rdquo;</p>` : ""}
    ${negotiation.legalImpact ? `<p style="margin-top:6px"><strong>Legal Impact:</strong> ${negotiation.legalImpact}</p>` : ""}
    ${negotiation.businessImpact ? `<p style="margin-top:6px"><strong>Business Impact:</strong> ${negotiation.businessImpact}</p>` : ""}
    ${negotiation.fallbackPosition ? `<p style="margin-top:6px"><strong>Fallback:</strong> ${negotiation.fallbackPosition}</p>` : ""}
  </div>` : ""}
</div>`;
      });

      // --- AUDIT LOG ---
      const agentNames = ["Ingestion", "Segmentation", "Classification", "Retrieval", "Risk Review", "Redline", "Verifier", "Negotiation Coach"];
      let auditHtml = "";
      let totalPipelineTime = 0;
      let verifierRejections = reviews.filter((r: any) => r.verifierStatus === "REJECTED").length;
      let evidenceCount = reviews.reduce((acc: number, r: any) => acc + (r.evidenceSources?.length || 0), 0);

      if (agentRuns.length > 0) {
        agentRuns.forEach((run: any) => {
          const duration = run.startedAt && run.completedAt
            ? ((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)
            : "-";
          if (duration !== "-") totalPipelineTime += parseFloat(duration);
          const agentLabel = agentNames.find(n => run.agentName?.toLowerCase().includes(n.toLowerCase())) || run.agentName;
          const statusIcon = run.status === "COMPLETED" ? "&#10003;" : "&#10007;";
          const statusColor = run.status === "COMPLETED" ? "#16a34a" : "#dc2626";
          let extra = "";
          if (agentLabel === "Verifier" && verifierRejections > 0) {
            extra = ` &mdash; ${verifierRejections} rejection${verifierRejections > 1 ? "s" : ""}, ${verifierRejections} re-retrieval${verifierRejections > 1 ? "s" : ""} triggered`;
          }
          auditHtml += `<tr><td class="agent-name">${agentLabel} Agent</td><td class="agent-status" style="color:${statusColor}">${statusIcon} ${run.status}</td><td class="agent-time">${duration}s${extra}</td></tr>`;
        });
      } else {
        agentNames.forEach(name => {
          auditHtml += `<tr><td class="agent-name">${name} Agent</td><td class="agent-status" style="color:#16a34a">&#10003; COMPLETED</td><td class="agent-time">-</td></tr>`;
        });
      }

      // Contract creation date for audit log
      const contractCreatedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
      const reviewCompletedDate = agentRuns.length > 0 && agentRuns[agentRuns.length - 1].completedAt
        ? new Date(agentRuns[agentRuns.length - 1].completedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "N/A";

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClauseGuard Review - ${c.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; color: #1a1a2e; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 50px 60px; page-break-after: always; min-height: 100vh; position: relative; }
    .page:last-child { page-break-after: auto; }
    .page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; border-bottom: 2px solid #d97706; padding-bottom: 8px; }
    .page-subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; margin-top: 4px; }

    /* Cover Page */
    .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .logo { font-size: 32px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; margin-bottom: 2px; }
    .logo span { color: #d97706; }
    .tagline { font-size: 12px; color: #d97706; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
    .cover-line { width: 80px; height: 3px; background: #d97706; margin: 0 auto 30px; }
    .report-type { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .report-id { font-size: 10px; color: #d97706; font-family: monospace; letter-spacing: 1px; margin-bottom: 20px; }
    .contract-name { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; max-width: 500px; }
    .parties-box { display: flex; gap: 24px; justify-content: center; margin-bottom: 20px; }
    .party-card { padding: 12px 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
    .party-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .party-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .cover-meta { font-size: 12px; color: #6b7280; margin: 3px 0; line-height: 1.6; }
    .cover-meta strong { color: #374151; }
    .reviewed-by { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    .reviewed-by strong { color: #6b7280; }

    /* Executive Summary */
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { text-align: center; padding: 16px 8px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .summary-card .num { font-size: 28px; font-weight: 800; line-height: 1; }
    .summary-card .label { font-size: 10px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .overall-risk { display: inline-block; padding: 8px 24px; border-radius: 6px; font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .summary-text { font-size: 13px; line-height: 1.7; color: #374151; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #d97706; margin-bottom: 20px; }

    /* Risk Breakdown Table */
    .breakdown-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .breakdown-table th { text-align: left; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; padding: 8px 10px; border-bottom: 2px solid #e5e7eb; }
    .breakdown-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; vertical-align: top; }
    .breakdown-clause { font-weight: 600; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
    .breakdown-issue { color: #4b5563; line-height: 1.5; }

    /* Key Observations */
    .observations-list { padding: 16px 16px 16px 32px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; }
    .observations-list li { font-size: 12px; line-height: 1.7; color: #374151; margin-bottom: 6px; }
    .observations-list li:last-child { margin-bottom: 0; }

    /* Missing Clauses */
    .missing-clause { margin-bottom: 20px; page-break-inside: avoid; }
    .missing-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .missing-header h3 { font-size: 15px; font-weight: 700; }
    .missing-badge { background: #dc2626 !important; font-size: 10px; }
    .recommended-text { background: #f0fdf4; border-left: 3px solid #16a34a; }
    .recommended-text .section-label { color: #16a34a; }
    .red-flags-section { background: #fef2f2; border-left: 3px solid #dc2626; }
    .red-flags-section .section-label { color: #dc2626; }
    .must-have-section { background: #fff7ed; border-left: 3px solid #d97706; }
    .must-have-section .section-label { color: #d97706; }

    /* Clause Detail */
    .clause { margin-bottom: 28px; page-break-inside: avoid; }
    .clause-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .clause-number { font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; }
    .clause-title { font-size: 15px; font-weight: 700; color: #1a1a2e; }
    .divider { height: 1px; background: #e5e7eb; margin: 8px 0 12px; }
    .risk-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { padding: 10px 14px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; }
    .section-label { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .section p { font-size: 12px; line-height: 1.6; color: #374151; }
    .quote { font-style: italic; color: #4b5563; }
    .rationale { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .redline-section { background: #f0fdf4; border-left: 3px solid #16a34a; }
    .redline-section .section-label { color: #16a34a; }
    .evidence-section { background: #fff7ed; border-left: 3px solid #d97706; }
    .evidence-section .section-label { color: #d97706; }
    .preferred { font-size: 11px; color: #92400e; margin-top: 4px; }
    .negotiation-section { background: #fffbeb; border-left: 3px solid #d97706; }
    .negotiation-section .section-label { color: #d97706; }
    .negotiation-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .stance-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #fff; text-transform: uppercase; }

    /* Audit Log */
    .audit-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .audit-table th { text-align: left; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
    .audit-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
    .agent-name { font-weight: 600; }
    .agent-status { font-weight: 600; }
    .agent-time { color: #6b7280; }
    .audit-summary { padding: 16px; background: #f9fafb; border-radius: 8px; font-size: 12px; line-height: 1.8; color: #374151; }
    .audit-summary strong { color: #1a1a2e; }

    /* Print */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 30px 40px; min-height: auto; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Cover -->
  <div class="page cover">
    <div class="logo">Clause<span>Guard</span> India</div>
    <div class="tagline">AI Contract Review</div>
    <div class="cover-line"></div>
    <div class="report-type">Contract Review Report</div>
    <div class="report-id">Report ID: ${reportId}</div>
    <div class="contract-name">${c.title}</div>
    <div class="parties-box">
      <div class="party-card">
        <div class="party-label">Party A</div>
        <div class="party-name">${party1}</div>
      </div>
      <div class="party-card">
        <div class="party-label">Party B</div>
        <div class="party-name">${party2}</div>
      </div>
    </div>
    ${c.jurisdictionGuess ? `<div class="cover-meta"><strong>Jurisdiction:</strong> ${c.jurisdictionGuess}</div>` : ""}
    ${c.governingLawGuess ? `<div class="cover-meta"><strong>Governing Law:</strong> ${c.governingLawGuess}</div>` : ""}
    <div class="cover-meta"><strong>Contract Type:</strong> Vendor Agreement</div>
    <div class="cover-meta"><strong>Review Date:</strong> ${date} at ${time}</div>
    <div class="cover-meta"><strong>Status:</strong> ${c.status || "COMPLETED"}</div>
    <div class="reviewed-by">Reviewed by: <strong>ClauseGuard India AI</strong><br>Powered by 8-agent pipeline with independent verification</div>
  </div>

  <!-- PAGE 2: Executive Summary -->
  <div class="page">
    <h2 class="page-title">Executive Summary</h2>
    <p class="page-subtitle">One-glance overview of the contract review findings.</p>

    <div class="summary-grid">
      <div class="summary-card" style="border-color:#e5e7eb"><div class="num" style="color:#1a1a2e">${totalClauses}</div><div class="label">Total Clauses</div></div>
      <div class="summary-card" style="border-color:#bbf7d0;background:#f0fdf4"><div class="num" style="color:#16a34a">${clean}</div><div class="label">Clean</div></div>
      <div class="summary-card" style="border-color:#fecaca;background:#fef2f2"><div class="num" style="color:#dc2626">${highRisk}</div><div class="label">High Risk</div></div>
      <div class="summary-card" style="border-color:#fde68a;background:#fffbeb"><div class="num" style="color:#d97706">${midRisk}</div><div class="label">Medium Risk</div></div>
      <div class="summary-card" style="border-color:#fecaca;background:#fef2f2"><div class="num" style="color:#dc2626">${missingClauses.length}</div><div class="label">Missing</div></div>
    </div>

    <div style="text-align:center;margin-bottom:20px">
      <span class="overall-risk" style="background:${overallColor}">Overall Risk: ${overallRisk}</span>
    </div>

    <div class="summary-text">${summaryText}</div>

    <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;color:#1a1a2e">Risk Breakdown</h3>
    ${riskBreakdownHtml}

    <h3 style="font-size:14px;font-weight:700;margin:20px 0 12px;color:#1a1a2e">Key Observations</h3>
    <ul class="observations-list">${observationsHtml}</ul>
  </div>

  <!-- PAGE 3: Missing Clauses (if any) -->
  ${missingHtml}

  <!-- PAGES 4+: Clause-by-Clause Review -->
  <div class="page">
    <h2 class="page-title">Clause-by-Clause Review</h2>
    <p class="page-subtitle">Detailed analysis of flagged clauses, ordered by risk severity (High &rarr; Medium). Each clause includes original text, identified issues, suggested redline, evidence source, and negotiation guidance.</p>
    ${clausesHtml}
  </div>

  <!-- LAST PAGE: Audit Log -->
  <div class="page">
    <h2 class="page-title">Audit Log</h2>
    <p class="page-subtitle">Agent pipeline execution record for compliance and legal audit purposes.</p>

    <table class="audit-table">
      <thead><tr><th>Agent</th><th>Status</th><th>Duration</th></tr></thead>
      <tbody>${auditHtml}</tbody>
    </table>

    <div class="audit-summary">
      <strong>Contract uploaded:</strong> ${contractCreatedDate}<br>
      <strong>Review completed:</strong> ${reviewCompletedDate}<br>
      <strong>Total pipeline time:</strong> ${totalPipelineTime > 0 ? totalPipelineTime.toFixed(1) + "s" : "N/A"}<br>
      <strong>Verifier rejections:</strong> ${verifierRejections}<br>
      <strong>Evidence sources used:</strong> ${evidenceCount} playbook rules<br>
      <strong>Report generated at:</strong> ${date} ${time}<br>
      <strong>Report ID:</strong> ${reportId}
    </div>

    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af">
      Generated by ClauseGuard India &middot; ${date} &middot; This is an AI-generated review and should be verified by a qualified legal professional.
    </div>
  </div>

</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ClauseGuard-Review-${c.title.replace(/[^a-zA-Z0-9]/g, "-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to export report");
    }
    setExporting(false);
  }

  function runReview() {
    setReviewOpen(true);
  }

  function onReviewComplete() {
    setReviewOpen(false);
    toast.success("Review completed");
    loadContract();
  }

  function onReviewError(message: string) {
    setReviewRunning(false);
    toast.error(message);
  }

  async function selectClause(clause: any) {
    setSelectedClause(clause);
    const res = await fetch(`/api/contracts/${id}`);
    const data = await res.json();
    setContract(data.contract);
    const review = data.contract.clauseReviews?.find((r: any) => r.clauseId === clause.id);
    setSelectedReview(review);
  }

  const riskColors: Record<string, string> = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const stanceColors: Record<string, string> = {
    PUSH_HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    NEGOTIABLE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    STANDARD: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  if (!contract) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading contract...</p></div>;
  }

  const totalClauses = contract.clauses?.length || 0;
  const reviewedClauses = contract.clauseReviews?.length || 0;
  const highRiskClauses = contract.clauseReviews?.filter((r: any) => r.riskLevel === "HIGH").length || 0;
  const verifierRejected = contract.clauseReviews?.filter((r: any) => r.verifierStatus === "REJECTED").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/contracts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{contract.title}</h1>
            <p className="text-xs text-muted-foreground">
              {contract.jurisdictionGuess} &middot; {contract.governingLawGuess}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reviewedClauses > 0 && (
            <Button
              onClick={exportReport}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Report"}
            </Button>
          )}
          <Button
            onClick={runReview}
            disabled={reviewOpen}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            {reviewOpen ? "Running..." : "Run Full Review"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4 border-border/50"><p className="text-2xl font-bold">{totalClauses}</p><p className="text-xs text-muted-foreground">Total Clauses</p></Card>
        <Card className="p-4 border-border/50"><p className="text-2xl font-bold text-red-600">{highRiskClauses}</p><p className="text-xs text-muted-foreground">High Risk</p></Card>
        <Card className="p-4 border-border/50"><p className="text-2xl font-bold text-amber-600">{verifierRejected}</p><p className="text-xs text-muted-foreground">Verifier Interventions</p></Card>
        <Card className="p-4 border-border/50"><p className="text-2xl font-bold">{reviewedClauses}/{totalClauses}</p><p className="text-xs text-muted-foreground">Clauses Reviewed</p></Card>
      </div>

      {!contract.extractedText && (
        <Card className="p-5 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <h3 className="text-sm font-semibold mb-2">Contract Text Required</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Paste the contract text below to start the review.
          </p>
          <textarea
            className="w-full h-40 rounded-lg border border-border bg-background p-3 text-sm resize-y"
            placeholder="Paste the contract text here..."
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={saveContractText}
              disabled={savingText || !contractText.trim()}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {savingText ? "Saving..." : "Save Text"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Clause List */}
        <div className="col-span-3">
          <Card className="border-border/50">
            <div className="p-3 border-b border-border/50">
              <h3 className="text-sm font-semibold">Clauses</h3>
            </div>
            <ScrollArea className="h-[600px]">
              {contract.clauses?.map((clause: any) => {
                const review = contract.clauseReviews?.find((r: any) => r.clauseId === clause.id);
                const isSelected = selectedClause?.id === clause.id;
                return (
                    <div
                      key={clause._id}
                      className={`p-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500" : ""}`}
                      onClick={() => selectClause(clause)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{clause.clauseNumber}</span>
                      {review && (
                        <Badge className={riskColors[review.riskLevel] || ""} variant="secondary">
                          {review.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{clause.heading || clause.clauseType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground capitalize">{clause.clauseType}</span>
                      {review?.verifierStatus === "REJECTED" && (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      {review?.verifierStatus === "APPROVED" && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </Card>
        </div>

        {/* Center Panel - Clause Detail */}
        <div className="col-span-5">
          {selectedClause ? (
            <div className="space-y-4">
              <Card className="p-5 border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {selectedClause.clauseNumber}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedClause.clauseType}
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2">Original Clause Text</h3>
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 border border-border/50 max-h-48 overflow-y-auto">
                    {selectedClause.text}
                  </div>
                </div>

                {selectedReview && (
                  <>
                    <Separator className="my-4" />

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={riskColors[selectedReview.riskLevel] || ""}>
                        {selectedReview.riskLevel} Risk
                      </Badge>
                      {selectedReview.verifierStatus === "APPROVED" && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verifier Approved
                        </Badge>
                      )}
                      {selectedReview.verifierStatus === "REJECTED" && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <XCircle className="h-3 w-3 mr-1" /> Verifier Rejected
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issue Summary</h4>
                        <p className="text-sm">{selectedReview.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">India Angle</h4>
                        <p className="text-sm">{selectedReview.indiaAngle}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why It Matters</h4>
                        <p className="text-sm">{selectedReview.whyItMatters}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recommended Action</h4>
                        <p className="text-sm">{selectedReview.recommendedAction}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Redline Suggestion */}
                    {selectedReview.redlineSuggestions?.[0] && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Redline Suggestion</h4>
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-2">
                          <p className="text-sm font-medium mb-1">Suggested Text:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedReview.redlineSuggestions[0].suggestedText}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rationale: {selectedReview.redlineSuggestions[0].rationale}
                        </p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Negotiation Coach */}
                    {selectedReview.negotiationRecommendations?.[0] && (
                      <div className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-amber-600" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider">Negotiation Coach</h4>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={stanceColors[selectedReview.negotiationRecommendations[0].stance] || ""}>
                            {selectedReview.negotiationRecommendations[0].stance.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Legal Impact:</span> {selectedReview.negotiationRecommendations[0].legalImpact}</p>
                          <p><span className="font-medium">Business Impact:</span> {selectedReview.negotiationRecommendations[0].businessImpact}</p>
                          <p><span className="font-medium">Fallback:</span> {selectedReview.negotiationRecommendations[0].fallbackPosition}</p>
                          <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded p-3 mt-2">
                            <p className="text-xs font-medium mb-1">Talking Point:</p>
                            <p className="text-sm italic">"{selectedReview.negotiationRecommendations[0].talkingPoint}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-border/50">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Select a clause to view its review</p>
            </Card>
          )}
        </div>

        {/* Right Panel - Evidence & Verifier */}
        <div className="col-span-4">
          {selectedReview ? (
            <div className="space-y-4">
              {/* Evidence Drawer - Collapsible */}
              <Card className="p-4 border-border/50">
                <button
                  onClick={() => setEvidenceOpen(!evidenceOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold">Evidence Citations</h3>
                    {selectedReview.evidenceSources?.length > 0 && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {selectedReview.evidenceSources.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${evidenceOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {evidenceOpen && (
                  <div className="space-y-3 mt-3 border-t border-border/50 pt-3">
                    {selectedReview.evidenceSources?.map((ev: any) => {
                      const ruleNumber = ev.playbookRuleId ? `#${ev.playbookRuleId.toString().slice(-4).toUpperCase()}` : "";
                      return (
                        <div key={ev._id} className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-100/50 dark:bg-amber-900/50 dark:text-amber-300">
                              {ev.sourceType === "playbook" ? "PLAYBOOK RULE" : ev.sourceType?.toUpperCase() || "SOURCE"}
                            </Badge>
                            {ev.relevanceScore && (
                              <span className="text-[10px] text-muted-foreground">
                                Score: {Math.round(ev.relevanceScore * 100)}%
                              </span>
                            )}
                          </div>
                          {ev.ruleName || ev.playbookRuleId ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                Source: Playbook Rule {ruleNumber} · {ev.ruleName?.replace(/Playbook Rule #[A-Z0-9]+ /, "") || ev.title}
                              </p>
                              {ev.citationLabel && (
                                <p className="text-[11px] text-muted-foreground italic">
                                  Why matched: {ev.citationLabel}
                                </p>
                              )}
                              {ev.preferredLanguage && (
                                <div className="bg-white dark:bg-amber-950/30 border border-amber-200/60 rounded p-2.5">
                                  <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wider">Approved Wording</p>
                                  <p className="text-xs text-foreground/80 leading-relaxed">"{ev.preferredLanguage}"</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-medium mb-1 text-foreground/80">{ev.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-3">{ev.excerpt}</p>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {(!selectedReview.evidenceSources || selectedReview.evidenceSources.length === 0) && (
                      <p className="text-xs text-muted-foreground py-2">No evidence retrieved yet. Run the review.</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Verifier Timeline */}
              {selectedReview.verifierStatus !== "PENDING" && (
                <Card className="p-4 border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold">Verifier Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <SearchIcon className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Retrieval v1</p>
                        <p className="text-[10px] text-muted-foreground">Initial evidence retrieval</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Redline v1</p>
                        <p className="text-[10px] text-muted-foreground">Initial redline draft</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          selectedReview.verifierStatus === "REJECTED"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-green-100 dark:bg-green-900"
                        }`}>
                          {selectedReview.verifierStatus === "REJECTED" ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        {selectedReview.verifierStatus === "REJECTED" && <div className="w-0.5 h-8 bg-border" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium">Verifier {selectedReview.verifierStatus === "REJECTED" ? "Rejected" : "Approved"}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedReview.verifierReason}</p>
                      </div>
                    </div>
                    {selectedReview.verifierStatus === "REJECTED" && (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                              <RefreshCw className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="w-0.5 h-8 bg-border" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Retrieval v2</p>
                            <p className="text-[10px] text-muted-foreground">Refined re-retrieval</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <FileText className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="w-0.5 h-8 bg-border" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Redline v2</p>
                            <p className="text-[10px] text-muted-foreground">Corrected redline</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Verifier Approved</p>
                            <p className="text-[10px] text-muted-foreground">After re-retrieval</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-border/50">
              <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Run the review to see evidence and verifier output</p>
            </Card>
          )}
        </div>
      </div>

      <ReviewProgress
        contractId={id}
        open={reviewOpen}
        onComplete={onReviewComplete}
        onError={onReviewError}
      />
    </div>
  );
}
