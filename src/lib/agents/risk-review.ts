import { connectDB } from "../db/mongodb";
import { Clause } from "../db/models";
import { generateJSONCompletion } from "../ai/client";
import { PROMPTS } from "../prompts";
import { EvidenceItem, RiskLevel } from "../types";

export async function reviewClause(
  clauseId: string,
  evidence?: EvidenceItem[]
): Promise<{
  riskLevel: RiskLevel;
  summary: string;
  whyItMatters: string;
  indiaAngle: string;
  recommendedAction: string;
  playbookRuleIds?: string[];
}> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) throw new Error("Clause not found");

  const evidenceContext = evidence && evidence.length > 0
    ? `\nAvailable Playbook Rules:\n${evidence
        .filter(e => e.playbookRuleId)
        .map(e => `- Rule ID: ${e.playbookRuleId} | Name: ${e.ruleName || e.title} | Preferred: ${e.preferredLanguage || e.excerpt.substring(0, 200)}`)
        .join("\n")}`
    : "";

  const result = await generateJSONCompletion<{
    riskLevel: RiskLevel;
    summary: string;
    whyItMatters: string;
    indiaAngle: string;
    recommendedAction: string;
    playbookRuleIds?: string[];
  }>(
    PROMPTS.riskReview,
    `Clause Type: ${clause.clauseType}\nHeading: ${clause.heading}\nText: ${clause.text.substring(0, 2500)}${evidenceContext}`
  );

  return {
    riskLevel: result?.riskLevel || "medium" as RiskLevel,
    summary: result?.summary || "Review this clause for Indian legal compliance.",
    whyItMatters: result?.whyItMatters || "This clause affects your legal obligations.",
    indiaAngle: result?.indiaAngle || "Standard Indian contract consideration.",
    recommendedAction: result?.recommendedAction || "Review with legal counsel.",
    playbookRuleIds: result?.playbookRuleIds,
  };
}
