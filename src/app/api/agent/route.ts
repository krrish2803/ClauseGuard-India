import { NextRequest, NextResponse } from "next/server";
import { AgentRun, AgentStep } from "@/lib/db/prisma";
import { connectDB } from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contractId = searchParams.get("contractId");
  const agentName = searchParams.get("agentName");

  const where: Record<string, string> = {};
  if (contractId) where.contractId = contractId;
  if (agentName) where.agentName = agentName;

  await connectDB();
  const runs = await AgentRun.find(where)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean({ virtuals: true });

  const enriched = await Promise.all(
    runs.map(async (r: any) => {
      const steps = await AgentStep.find({ runId: r._id.toString() }).lean({ virtuals: true });
      return { ...r, steps };
    })
  );

  return NextResponse.json({ runs: enriched });
}
