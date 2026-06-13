import { connectDB } from "../db/mongodb";
import { Contract, Clause, AgentRun } from "../db/models";
import { ParsedClause } from "../types";

export async function segmentClauses(contractId: string): Promise<ParsedClause[]> {
  await connectDB();
  const contract = await Contract.findById(contractId);
  if (!contract?.extractedText) {
    await Contract.findByIdAndUpdate(contractId, { status: "FAILED" });
    throw new Error("No extracted text — OCR may have failed");
  }

  await AgentRun.create({
    contractId,
    agentName: "segmentation",
    status: "RUNNING",
    startedAt: new Date(),
    inputJson: JSON.stringify({ contractId }),
  });

  // Clean up old clauses from any previous review runs
  await Clause.deleteMany({ contractId });

  const text = contract.extractedText;
  const lines = text.split("\n");
  const clauses: ParsedClause[] = [];
  let currentClause: ParsedClause | null = null;
  let clauseCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\d+\.?\d*)\s+(.+)/);

    if (match) {
      if (currentClause) clauses.push(currentClause);
      clauseCount++;
      currentClause = {
        clauseNumber: match[1].trim(),
        heading: match[2].trim().substring(0, 80),
        text: match[2].trim(),
        startOffset: i,
        endOffset: i,
      };
    } else if (currentClause) {
      currentClause.text += "\n" + line;
      currentClause.endOffset = i;
    }
  }
  if (currentClause) clauses.push(currentClause);

  if (clauses.length === 0) {
    // Fallback: split text into two halves for review
    const nonEmptyLines = lines.filter((l: string) => l.trim().length > 0);
    const mid = Math.max(1, Math.ceil(nonEmptyLines.length / 2));
    const firstHalf = nonEmptyLines.slice(0, mid).join("\n");
    const secondHalf = nonEmptyLines.slice(mid).join("\n");
    clauses.push({ clauseNumber: "1", heading: "First Section", text: firstHalf || "Contract text", startOffset: 0, endOffset: mid });
    if (secondHalf.trim()) {
      clauses.push({ clauseNumber: "2", heading: "Second Section", text: secondHalf, startOffset: mid, endOffset: nonEmptyLines.length });
    }
  }

  // Filter out any clauses with empty text (safety guard)
  const validClauses = clauses.filter(c => c.text && c.text.trim().length > 0);

  for (const clause of validClauses) {
    await Clause.create({
      contractId,
      clauseNumber: clause.clauseNumber,
      heading: clause.heading,
      text: clause.text,
      normalizedText: clause.text.toLowerCase().replace(/\s+/g, " "),
      clauseType: "unknown",
      startOffset: clause.startOffset,
      endOffset: clause.endOffset,
    });
  }

  await AgentRun.updateOne(
    { contractId, agentName: "segmentation", status: "RUNNING" },
    { $set: { status: "COMPLETED", completedAt: new Date(), outputJson: JSON.stringify({ clauseCount: validClauses.length }) } }
  );

  return validClauses;
}
