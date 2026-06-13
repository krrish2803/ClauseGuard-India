import { connectDB } from "../db/mongodb";
import { Clause, PlaybookRule } from "../db/models";
import { EvidenceItem } from "../types";

export async function retrieveEvidenceForClause(clauseId: string, query?: string): Promise<EvidenceItem[]> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) return [];

  const evidence: EvidenceItem[] = [];
  const allRules = await PlaybookRule.find().sort({ clauseType: 1 });
  const ruleIndex = allRules.findIndex(r => r.clauseType === clause.clauseType);
  const ruleNum = ruleIndex >= 0 ? ruleIndex + 1 : 0;
  const playbookRules = allRules.filter(r => r.clauseType === clause.clauseType);

  for (const rule of playbookRules) {
    if (rule.preferredLanguage) {
      evidence.push({
        sourceType: "playbook",
        title: `Playbook: ${clause.clauseType.replace(/_/g, " ")}`,
        excerpt: rule.preferredLanguage.substring(0, 500),
        citationLabel: `${rule.redFlags ? rule.redFlags.substring(0, 120) : `Matched clause type: ${clause.clauseType.replace(/_/g, " ")}`}`,
        relevanceScore: 0.95,
        playbookRuleId: rule._id.toString(),
        ruleName: `Playbook Rule #${ruleNum} · ${clause.clauseType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        preferredLanguage: rule.preferredLanguage.substring(0, 300),
      });
    }
    if (rule.sampleApprovedWording) {
      evidence.push({
        sourceType: "precedent",
        title: `Approved Wording: ${clause.clauseType.replace(/_/g, " ")}`,
        excerpt: rule.sampleApprovedWording.substring(0, 500),
        citationLabel: `Sample approved language for ${clause.clauseType.replace(/_/g, " ")} clauses under Indian law`,
        relevanceScore: 0.9,
        playbookRuleId: rule._id.toString(),
        ruleName: `Playbook Rule #${ruleNum} · ${clause.clauseType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        preferredLanguage: rule.preferredLanguage?.substring(0, 300),
      });
    }
  }

  if (evidence.length === 0) {
    evidence.push({
      sourceType: "guidance",
      title: `General Guidance: ${clause.clauseType}`,
      excerpt: `Standard Indian contract practice for ${clause.clauseType} clauses under Indian law. Consider DPDP Act 2023 implications for data-related clauses. Indian courts generally interpret ${clause.clauseType} clauses strictly.`,
      citationLabel: "ClauseGuard Knowledge Base",
      relevanceScore: 0.7,
    });
  }

  return evidence;
}

export async function retrieveWithRefinedQuery(clauseId: string, previousEvidence: EvidenceItem[], rejectionReason: string): Promise<EvidenceItem[]> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) return [];

  const allRules = await PlaybookRule.find().sort({ clauseType: 1 });
  const ruleIndex = allRules.findIndex(r => r.clauseType === clause.clauseType);
  const ruleNum = ruleIndex >= 0 ? ruleIndex + 1 : 0;
  const playbookRules = allRules.filter(r => r.clauseType === clause.clauseType);
  const evidence: EvidenceItem[] = [];

  for (const rule of playbookRules) {
    evidence.push({
      sourceType: "playbook",
      title: `Refined: ${rule.clauseType.replace(/_/g, " ")}`,
      excerpt: (rule.preferredLanguage || "") + " " + (rule.sampleApprovedWording || ""),
      citationLabel: `Re-retrieved after verifier rejection — ${rule.redFlags ? rule.redFlags.substring(0, 120) : `matched ${clause.clauseType.replace(/_/g, " ")}`}`,
      relevanceScore: 0.98,
      playbookRuleId: rule._id.toString(),
      ruleName: `Playbook Rule #${ruleNum} · ${clause.clauseType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
      preferredLanguage: rule.preferredLanguage?.substring(0, 300),
    });
    if (rule.redFlags) {
      evidence.push({
        sourceType: "policy",
        title: `Red Flags: ${rule.clauseType.replace(/_/g, " ")}`,
        excerpt: rule.redFlags,
        citationLabel: `Identified red flags for ${clause.clauseType.replace(/_/g, " ")}: ${rule.redFlags.substring(0, 120)}`,
        relevanceScore: 0.96,
        playbookRuleId: rule._id.toString(),
        ruleName: `Playbook Rule #${ruleNum} · ${clause.clauseType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        preferredLanguage: rule.preferredLanguage?.substring(0, 300),
      });
    }
  }

  return evidence.length > 0 ? evidence : previousEvidence;
}
