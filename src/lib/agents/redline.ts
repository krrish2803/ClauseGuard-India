import { connectDB } from "../db/mongodb";
import { Clause } from "../db/models";
import { generateJSONCompletion } from "../ai/client";
import { PROMPTS } from "../prompts";
import { EvidenceItem } from "../types";

export async function draftRedline(
  clauseId: string,
  evidence: EvidenceItem[]
): Promise<{ suggestedText: string; rationale: string }> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) throw new Error("Clause not found");

  const evidenceText = evidence.map(e => `[${e.sourceType}] ${e.title}: ${e.excerpt}`).join("\n\n");

  const result = await generateJSONCompletion<{ suggestedText: string; rationale: string; evidenceUsed: string[] }>(
    PROMPTS.draftRedline,
    `Clause Type: ${clause.clauseType}\nOriginal text: ${clause.text.substring(0, 2000)}\n\nRetrieved evidence:\n${evidenceText.substring(0, 3000)}`
  );

  return {
    suggestedText: result?.suggestedText || clause.text,
    rationale: result?.rationale || "Revised for Indian legal standards.",
  };
}
