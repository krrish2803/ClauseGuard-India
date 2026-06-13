export type ClauseType =
  | "confidentiality"
  | "data_protection"
  | "sub_processing"
  | "audit_rights"
  | "breach_notification"
  | "limitation_of_liability"
  | "indemnity"
  | "termination"
  | "dispute_resolution"
  | "governing_law"
  | "ip_ownership"
  | "payment"
  | "sla"
  | "non_solicit"
  | "assignment"
  | "warranty"
  | "definition"
  | "general"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high";
export type VerifierStatus = "pending" | "approved" | "rejected";
export type NegotiationStance = "push_hard" | "negotiable" | "standard";
export type AgentType =
  | "ingestion"
  | "segmentation"
  | "classification"
  | "retrieval"
  | "risk_review"
  | "redline"
  | "verifier"
  | "negotiation_coach"
  | "review_composer";

export interface ParsedClause {
  clauseNumber: string;
  heading: string;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface EvidenceItem {
  sourceType: string;
  title: string;
  excerpt: string;
  citationLabel?: string;
  relevanceScore?: number;
  playbookRuleId?: string;
  ruleName?: string;
  preferredLanguage?: string;
}

export interface ClauseReviewResult {
  clauseId: string;
  clauseType: ClauseType;
  riskLevel: RiskLevel;
  summary: string;
  whyItMatters: string;
  indiaAngle: string;
  recommendedAction: string;
  evidence: EvidenceItem[];
  suggestedRedline: {
    originalText: string;
    suggestedText: string;
    rationale: string;
  };
  verifierStatus: VerifierStatus;
  verifierReason?: string;
  negotiationStance: NegotiationStance;
  fallbackPosition: string;
  talkingPoint: string;
}

export interface ProgressEvent {
  agent: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  message?: string;
  total?: number;
  current?: number;
}

export interface ContractReviewResult {
  contractId: string;
  title: string;
  totalClauses: number;
  highRiskClauses: number;
  verifierInterventions: number;
  pushHardClauses: number;
  indiaSpecificFlags: number;
  summary: string;
  topRisks: string[];
  topRedlines: string[];
  negotiationPriorities: string[];
  clauses: ClauseReviewResult[];
}
