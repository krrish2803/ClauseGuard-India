import { connectDB } from "../db/mongodb";
import { Clause } from "../db/models";
import { generateJSONCompletion } from "../ai/client";
import { PROMPTS } from "../prompts";
import { ClauseType } from "../types";

export async function classifyClause(clauseId: string): Promise<ClauseType> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) throw new Error("Clause not found");

  const result = await generateJSONCompletion<{ clauseType: ClauseType; confidence: number; reasoning: string }>(
    PROMPTS.classifyClause,
    `Clause heading: ${clause.heading}\nClause text: ${clause.text.substring(0, 2000)}`
  );

  const clauseType = result?.clauseType || "unknown";
  await Clause.findByIdAndUpdate(clauseId, { clauseType });

  return clauseType as ClauseType;
}

export async function classifyAllClauses(contractId: string): Promise<void> {
  await connectDB();
  const clauses = await Clause.find({ contractId });
  for (const clause of clauses) {
    await classifyClause(clause._id.toString());
  }
}
