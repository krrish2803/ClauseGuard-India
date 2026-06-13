import { connectDB } from "../db/mongodb";
import { Contract, AgentRun, Upload } from "../db/models";

export async function ingestContract(contractId: string): Promise<{ title: string; extractedText: string; jurisdictionGuess: string; governingLawGuess: string }> {
  await connectDB();
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error("Contract not found");

  const upload = await Upload.findOne({ contractId });
  const rawText = upload?.parsedText || contract.extractedText || "";
  const lines = rawText.split("\n").filter((l: string) => l.trim());
  const title = lines[0] || contract.title;

  const jurisdictionGuess = "India";
  const governingLawGuess = rawText.toLowerCase().includes("governing law") || rawText.toLowerCase().includes("governing")
    ? "India"
    : "Likely India (verify)";

  await Contract.findByIdAndUpdate(contractId, {
    title,
    extractedText: rawText,
    jurisdictionGuess,
    governingLawGuess,
    status: "PARSING",
  });

  await AgentRun.create({
    contractId,
    agentName: "ingestion",
    status: "COMPLETED",
    startedAt: new Date(),
    completedAt: new Date(),
    inputJson: JSON.stringify({ contractId }),
    outputJson: JSON.stringify({ title, extractedTextLength: rawText.length }),
  });

  return { title, extractedText: rawText, jurisdictionGuess, governingLawGuess };
}
