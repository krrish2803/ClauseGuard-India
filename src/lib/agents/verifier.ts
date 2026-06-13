import { generateJSONCompletion } from "../ai/client";
import { PROMPTS } from "../prompts";
import { EvidenceItem } from "../types";

export async function verifyRedline(
  originalText: string,
  suggestedText: string,
  rationale: string,
  evidence: EvidenceItem[]
): Promise<{ approved: boolean; reason: string; missingEvidence?: string; betterQuery?: string }> {
  const evidenceText = evidence.map(e => `[${e.sourceType}] ${e.title}: ${e.excerpt.substring(0, 300)}`).join("\n\n");

  const result = await generateJSONCompletion<{
    approved: boolean;
    reason: string;
    missingEvidence?: string;
    betterQuery?: string;
  }>(
    PROMPTS.verifyRedline,
    `Original: ${originalText.substring(0, 1000)}\nSuggested: ${suggestedText.substring(0, 1000)}\nRationale: ${rationale}\n\nEvidence:\n${evidenceText.substring(0, 3000)}`
  );

  return {
    approved: result?.approved ?? false,
    reason: result?.reason || "Verification incomplete.",
    missingEvidence: result?.missingEvidence,
    betterQuery: result?.betterQuery,
  };
}
