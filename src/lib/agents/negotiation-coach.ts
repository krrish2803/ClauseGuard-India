import { connectDB } from "../db/mongodb";
import { Clause } from "../db/models";
import { generateJSONCompletion } from "../ai/client";
import { PROMPTS } from "../prompts";
import { NegotiationStance, RiskLevel } from "../types";

export async function coachNegotiation(
  clauseId: string,
  riskLevel: RiskLevel
): Promise<{
  stance: NegotiationStance;
  legalImpact: string;
  businessImpact: string;
  fallbackPosition: string;
  talkingPoint: string;
}> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) throw new Error("Clause not found");

  const result = await generateJSONCompletion<{
    stance: NegotiationStance;
    legalImpact: string;
    businessImpact: string;
    fallbackPosition: string;
    talkingPoint: string;
  }>(
    PROMPTS.negotiateCoach,
    `Clause Type: ${clause.clauseType}\nRisk Level: ${riskLevel}\nHeading: ${clause.heading}\nText: ${clause.text.substring(0, 2000)}`
  );

  return {
    stance: result?.stance || "negotiable",
    legalImpact: result?.legalImpact || "Standard legal impact under Indian law.",
    businessImpact: result?.businessImpact || "Consider business implications.",
    fallbackPosition: result?.fallbackPosition || "Seek legal counsel for fallback position.",
    talkingPoint: result?.talkingPoint || "Discuss with counterparty.",
  };
}
