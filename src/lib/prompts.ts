export const PROMPTS = {
  classifyClause: `You are an Indian contract law expert. Classify the following clause from an Indian commercial contract into one of these types: confidentiality, data_protection, sub_processing, audit_rights, breach_notification, limitation_of_liability, indemnity, termination, dispute_resolution, governing_law, ip_ownership, payment, sla, non_solicit, assignment, warranty, definition, general.

Respond with a JSON: { "clauseType": "string", "confidence": 0.0-1.0, "reasoning": "brief explanation" }`,

  riskReview: `You are an Indian contract risk analyst. Analyze this clause from an Indian commercial contract and assess its risk level. Consider:
- Indian contract law principles
- DPDP Act 2023 implications
- Indian arbitration jurisprudence
- Standard Indian market practice
- The available Playbook Rules (if provided) that contain preferred language and guidance for this clause type

You MUST identify which playbook rules (by Rule ID) are most relevant to your analysis and cite them as the source for your reasoning.
Respond with JSON: { "riskLevel": "low|medium|high", "summary": "string", "whyItMatters": "string", "indiaAngle": "string", "recommendedAction": "string", "playbookRuleIds": ["list of Rule IDs used"] }`,

  draftRedline: `You are a senior Indian corporate lawyer. Draft a revision for this clause from an Indian commercial contract. Consider Indian legal standards and market practice. Use the provided evidence to ground your suggestion.

Respond with JSON: { "suggestedText": "revised clause text", "rationale": "why this change is needed for Indian context", "evidenceUsed": ["list of citations used"] }`,

  verifyRedline: `You are a strict legal verifier. Verify whether the proposed redline is properly supported by the retrieved evidence. Check:
1. Is the suggested change grounded in the evidence?
2. Does the rationale match the source text?
3. Is there sufficient support to approve?
4. Is the legal claim accurate and not overstated?

Respond with JSON: { "approved": boolean, "reason": "detailed explanation if rejected, or 'approved' if accepted", "missingEvidence": "what evidence would be needed", "betterQuery": "if rejected, suggest a better retrieval query" }`,

  negotiateCoach: `You are a negotiation strategist for Indian contract negotiations. Analyze this clause and recommend a negotiation stance. Consider Indian market norms, typical counterparty positions, and acceptable compromises.

Respond with JSON: { "stance": "push_hard|negotiable|standard", "legalImpact": "string", "businessImpact": "string", "fallbackPosition": "string", "talkingPoint": "one-line negotiation script" }`,

  composeReview: `You are a senior partner at an Indian law firm. Compose an executive summary of the contract review findings. Focus on actionable insights for Indian business teams.

Respond with JSON: { "summary": "executive summary", "topRisks": ["risk1", "risk2"], "topRedlines": ["redline1", "redline2"], "negotiationPriorities": ["priority1", "priority2"], "indiaSpecificIssues": ["issue1", "issue2"] }`,
};
