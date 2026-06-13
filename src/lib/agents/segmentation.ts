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
    const mid = Math.ceil(lines.length / 2);
    clauses.push({ clauseNumber: "1", heading: "First Section", text: lines.slice(0, mid).join("\n"), startOffset: 0, endOffset: mid });
    clauses.push({ clauseNumber: "2", heading: "Second Section", text: lines.slice(mid).join("\n"), startOffset: mid, endOffset: lines.length });
  }

  for (const clause of clauses) {
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
    { $set: { status: "COMPLETED", completedAt: new Date(), outputJson: JSON.stringify({ clauseCount: clauses.length }) } }
  );

  return clauses;
}
