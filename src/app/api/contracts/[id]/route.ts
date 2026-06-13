import { NextRequest, NextResponse } from "next/server";
import { Contract, Clause, ClauseReview, EvidenceSource, RedlineSuggestion, NegotiationRecommendation, AgentRun, AgentStep, PlaybookRule, Upload } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();
  const contract = await Contract.findById(id).lean({ virtuals: true });
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clauses = await Clause.find({ contractId: id }).lean({ virtuals: true });

  const clauseReviews = await ClauseReview.find({ contractId: id }).lean({ virtuals: true });
  const enrichedReviews = await Promise.all(
    clauseReviews.map(async (cr: any) => {
      const evidenceSources = await EvidenceSource.find({ clauseReviewId: cr._id.toString() }).lean({ virtuals: true });
      const redlineSuggestions = await RedlineSuggestion.find({ clauseReviewId: cr._id.toString() }).lean({ virtuals: true });
      const negotiationRecommendations = await NegotiationRecommendation.find({ clauseReviewId: cr._id.toString() }).lean({ virtuals: true });
      return { ...cr, evidenceSources, redlineSuggestions, negotiationRecommendations };
    })
  );

  const agentRuns = await AgentRun.find({ contractId: id }).sort({ createdAt: -1 }).lean({ virtuals: true });
  const enrichedRuns = await Promise.all(
    agentRuns.map(async (ar: any) => {
      const steps = await AgentStep.find({ runId: ar._id.toString() }).lean({ virtuals: true });
      return { ...ar, steps };
    })
  );

  // Detect missing clauses (playbook types not found in contract)
  const allPlaybooks = await PlaybookRule.find({}).lean({ virtuals: true });
  const foundTypes = new Set(clauses.map((c: any) => c.clauseType));
  const missingClauses = allPlaybooks
    .filter((p: any) => !foundTypes.has(p.clauseType))
    .map((p: any) => ({
      clauseType: p.clauseType,
      preferredLanguage: p.preferredLanguage,
      mustHaveTerms: p.mustHaveTerms,
      redFlags: p.redFlags,
      indiaNote: p.indiaNote,
      sampleApprovedWording: p.sampleApprovedWording,
    }));

  return NextResponse.json({
    contract: {
      ...contract,
      clauses,
      clauseReviews: enrichedReviews,
      agentRuns: enrichedRuns,
      missingClauses,
      playbookRules: allPlaybooks,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { extractedText } = body;

  if (typeof extractedText !== "string") {
    return NextResponse.json({ error: "extractedText is required" }, { status: 400 });
  }

  await connectDB();
  await Contract.findByIdAndUpdate(id, { extractedText });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const contract = await Contract.findById(id);
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clauseReviews = await ClauseReview.find({ contractId: id });
  const clauseReviewIds = clauseReviews.map((cr: any) => cr._id.toString());

  await EvidenceSource.deleteMany({ clauseReviewId: { $in: clauseReviewIds } });
  await RedlineSuggestion.deleteMany({ clauseReviewId: { $in: clauseReviewIds } });
  await NegotiationRecommendation.deleteMany({ clauseReviewId: { $in: clauseReviewIds } });
  await ClauseReview.deleteMany({ contractId: id });
  await Clause.deleteMany({ contractId: id });
  await AgentStep.deleteMany({ contractId: id });
  await AgentRun.deleteMany({ contractId: id });
  await Upload.deleteMany({ contractId: id });
  await Contract.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
