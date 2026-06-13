import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { Contract } from "@/lib/db/models";
import { runFullReview, runClauseReview } from "@/lib/orchestrator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { contractId, clauseId } = body;

  try {
    if (clauseId) {
      const result = await runClauseReview(clauseId);
      return NextResponse.json({ result });
    } else if (contractId) {
      const result = await runFullReview(contractId);
      return NextResponse.json({ result });
    }
    return NextResponse.json({ error: "contractId or clauseId required" }, { status: 400 });
  } catch (error) {
    console.error("Review error:", error);
    if (contractId) {
      await connectDB();
      await Contract.findByIdAndUpdate(contractId, { status: "FAILED" });
    }
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
