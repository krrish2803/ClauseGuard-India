import { NextResponse } from "next/server";
import { Contract, Clause, ClauseReview } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const contracts = await Contract.find({ createdById: session.user.id })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  const enriched = await Promise.all(
    contracts.map(async (c: any) => {
      const clauseCount = await Clause.countDocuments({ contractId: c._id.toString() });
      const clauseDocs = await Clause.find({ contractId: c._id.toString() }).select("_id").lean();
      const clauseIds = clauseDocs.map((cl) => cl._id.toString());
      const reviews = await ClauseReview.find({ clauseId: { $in: clauseIds } })
        .select("riskLevel")
        .lean({ virtuals: true });
      return { ...c, _count: { clauses: clauseCount }, clauseReviews: reviews };
    })
  );

  return NextResponse.json({ contracts: enriched });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, extractedText } = body;

  await connectDB();
  const contract = await Contract.create({
    title: title || "Untitled Contract",
    originalFilename: title || "untitled",
    extractedText: extractedText || "",
    status: "UPLOADING",
    createdById: session.user.id,
  });

  return NextResponse.json({ contract: contract.toObject({ virtuals: true }) });
}
