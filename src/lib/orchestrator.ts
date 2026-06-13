import { connectDB } from "./db/mongodb";
import { Contract, AgentRun, Clause, ClauseReview, EvidenceSource, RedlineSuggestion, NegotiationRecommendation, NegotiationStance } from "./db/models";
import { ingestContract } from "./agents/ingestion";
import { segmentClauses } from "./agents/segmentation";
import { classifyAllClauses } from "./agents/classification";
import { retrieveEvidenceForClause, retrieveWithRefinedQuery } from "./agents/retrieval";
import { reviewClause } from "./agents/risk-review";
import { draftRedline } from "./agents/redline";
import { verifyRedline } from "./agents/verifier";
import { coachNegotiation } from "./agents/negotiation-coach";
import { ClauseReviewResult, ContractReviewResult, EvidenceItem, ProgressEvent } from "./types";

async function cleanupPreviousReview(contractId: string) {
  // Remove old reviews and related data for re-review scenarios
  const oldReviews = await ClauseReview.find({ contractId }).select("_id").lean();
  if (oldReviews.length > 0) {
    const reviewIds = oldReviews.map(r => r._id.toString());
    await EvidenceSource.deleteMany({ clauseReviewId: { $in: reviewIds } });
    await RedlineSuggestion.deleteMany({ clauseReviewId: { $in: reviewIds } });
    await NegotiationRecommendation.deleteMany({ clauseReviewId: { $in: reviewIds } });
    await ClauseReview.deleteMany({ contractId });
  }
  await AgentRun.deleteMany({ contractId });
}

export async function runFullReview(contractId: string, onProgress?: (event: ProgressEvent) => void): Promise<ContractReviewResult> {
  function emit(agent: string, label: string, status: ProgressEvent["status"], message?: string, total?: number, current?: number) {
    onProgress?.({ agent, label, status, message, total, current });
  }

  await connectDB();
  await cleanupPreviousReview(contractId);
  await Contract.findByIdAndUpdate(contractId, { status: "REVIEWING" });

  emit("ingestion", "Ingesting contract", "running");
  await ingestContract(contractId);
  emit("ingestion", "Ingesting contract", "completed");

  emit("segmentation", "Segmenting clauses", "running");
  await segmentClauses(contractId);
  emit("segmentation", "Segmenting clauses", "completed");

  emit("classification", "Classifying clauses", "running");
  await classifyAllClauses(contractId);
  emit("classification", "Classifying clauses", "completed");

  const clauses = await Clause.find({ contractId });
  const clauseResults: ClauseReviewResult[] = [];
  let verifierInterventions = 0;
  let pushHardCount = 0;
  let indiaFlags = 0;

  for (const [idx, clause] of clauses.entries()) {
    const clauseId = clause._id.toString();
    const heading = clause.heading?.substring(0, 40) || `Clause ${idx + 1}`;
    emit("clause_review", `Reviewing clause ${idx + 1} of ${clauses.length}: ${heading}`, "running", undefined, clauses.length, idx + 1);
    const clauseReview = await ClauseReview.create({ clauseId, contractId });

    const evidence = await retrieveEvidenceForClause(clauseId);
    for (const ev of evidence) {
      await EvidenceSource.create({
        clauseReviewId: clauseReview._id.toString(),
        sourceType: ev.sourceType,
        title: ev.title,
        excerpt: ev.excerpt,
        citationLabel: ev.citationLabel,
        relevanceScore: ev.relevanceScore,
        playbookRuleId: ev.playbookRuleId,
        ruleName: ev.ruleName,
        preferredLanguage: ev.preferredLanguage,
      });
    }

    const riskReview = await reviewClause(clauseId, evidence);
    const redline = await draftRedline(clauseId, evidence);

    const verifierResult = await verifyRedline(
      clause.text,
      redline.suggestedText,
      redline.rationale,
      evidence
    );

    let finalRedline = redline;
    let finalVerifierStatus = verifierResult.approved ? "APPROVED" : "REJECTED";
    let finalVerifierReason = verifierResult.reason;

    if (!verifierResult.approved) {
      verifierInterventions++;
      const refinedEvidence = await retrieveWithRefinedQuery(clauseId, evidence, verifierResult.reason);
      const retryRedline = await draftRedline(clauseId, refinedEvidence);
      const retryVerifier = await verifyRedline(clause.text, retryRedline.suggestedText, retryRedline.rationale, refinedEvidence);

      if (retryVerifier.approved) {
        finalRedline = retryRedline;
        finalVerifierStatus = "APPROVED";
        finalVerifierReason = "Approved after re-retrieval.";
      } else {
        finalVerifierStatus = "REJECTED";
        finalVerifierReason = retryVerifier.reason;
      }

      for (const ev of refinedEvidence) {
        await EvidenceSource.create({
          clauseReviewId: clauseReview._id.toString(),
          sourceType: ev.sourceType,
          title: ev.title,
          excerpt: ev.excerpt,
          citationLabel: ev.citationLabel,
          relevanceScore: ev.relevanceScore,
          playbookRuleId: ev.playbookRuleId,
          ruleName: ev.ruleName,
          preferredLanguage: ev.preferredLanguage,
        });
      }
    }

    const negotiation = await coachNegotiation(clauseId, riskReview.riskLevel as any);
    emit("clause_review", `Reviewing clause ${idx + 1} of ${clauses.length}: ${heading}`, "completed", undefined, clauses.length, idx + 1);

    await ClauseReview.findByIdAndUpdate(clauseReview._id, {
      riskLevel: riskReview.riskLevel,
      summary: riskReview.summary,
      whyItMatters: riskReview.whyItMatters,
      indiaAngle: riskReview.indiaAngle,
      recommendedAction: riskReview.recommendedAction,
      verifierStatus: finalVerifierStatus,
      verifierReason: finalVerifierReason,
      verifierRetries: verifierResult.approved ? 0 : 1,
    });

    await RedlineSuggestion.create({
      clauseReviewId: clauseReview._id.toString(),
      originalText: clause.text,
      suggestedText: finalRedline.suggestedText,
      rationale: finalRedline.rationale,
      confidence: verifierResult.approved ? 0.85 : 0.6,
      approvedByVerifier: finalVerifierStatus === "APPROVED",
      version: 1,
    });

    const normalizedStance = (negotiation.stance?.toUpperCase() === "PUSH_HARD" ? "PUSH_HARD" : negotiation.stance?.toUpperCase() === "NEGOTIABLE" ? "NEGOTIABLE" : "STANDARD") as NegotiationStance;

    await NegotiationRecommendation.create({
      clauseReviewId: clauseReview._id.toString(),
      contractId,
      stance: normalizedStance,
      legalImpact: negotiation.legalImpact,
      businessImpact: negotiation.businessImpact,
      fallbackPosition: negotiation.fallbackPosition,
      talkingPoint: negotiation.talkingPoint,
    });

    if (normalizedStance === "PUSH_HARD") pushHardCount++;
    if (riskReview.indiaAngle && riskReview.indiaAngle.length > 20) indiaFlags++;

    clauseResults.push({
      clauseId,
      clauseType: clause.clauseType as any,
      riskLevel: riskReview.riskLevel as any,
      summary: riskReview.summary,
      whyItMatters: riskReview.whyItMatters,
      indiaAngle: riskReview.indiaAngle,
      recommendedAction: riskReview.recommendedAction,
      evidence: evidence.map(e => ({
        sourceType: e.sourceType,
        title: e.title,
        excerpt: e.excerpt,
        citationLabel: e.citationLabel,
        relevanceScore: e.relevanceScore,
      })),
      suggestedRedline: {
        originalText: clause.text,
        suggestedText: finalRedline.suggestedText,
        rationale: finalRedline.rationale,
      },
      verifierStatus: finalVerifierStatus as any,
      verifierReason: finalVerifierReason,
      negotiationStance: negotiation.stance as any,
      fallbackPosition: negotiation.fallbackPosition,
      talkingPoint: negotiation.talkingPoint,
    });
  }

  const highRisk = clauseResults.filter(c => c.riskLevel === "high").length;
  const contract = await Contract.findById(contractId);

  const contractResult: ContractReviewResult = {
    contractId,
    title: contract?.title || "Contract",
    totalClauses: clauseResults.length,
    highRiskClauses: highRisk,
    verifierInterventions,
    pushHardClauses: pushHardCount,
    indiaSpecificFlags: indiaFlags,
    summary: `Reviewed ${clauseResults.length} clauses. Found ${highRisk} high-risk items requiring attention.`,
    topRisks: clauseResults.filter(c => c.riskLevel === "high").map(c => `[${c.clauseType}] ${c.summary.substring(0, 100)}`),
    topRedlines: clauseResults.filter(c => c.verifierStatus === "approved").map(c => `[${c.clauseType}] Redline suggested`),
    negotiationPriorities: clauseResults.filter(c => c.negotiationStance === "push_hard").map(c => `[${c.clauseType}] ${c.talkingPoint}`),
    clauses: clauseResults,
  };

  emit("review_composer", "Composing final review", "running");
  await Contract.findByIdAndUpdate(contractId, { status: "COMPLETED" });
  emit("review_composer", "Composing final review", "completed");

  return contractResult;
}

export async function runClauseReview(clauseId: string): Promise<ClauseReviewResult> {
  await connectDB();
  const clause = await Clause.findById(clauseId);
  if (!clause) throw new Error("Clause not found");

  const existingReview = await ClauseReview.findOne({ clauseId });
  const clauseReview = existingReview || await ClauseReview.create({ clauseId });

  const evidence = await retrieveEvidenceForClause(clauseId);
  const riskReview = await reviewClause(clauseId, evidence);
  const redline = await draftRedline(clauseId, evidence);
  const verifierResult = await verifyRedline(clause.text, redline.suggestedText, redline.rationale, evidence);
  const negotiation = await coachNegotiation(clauseId, riskReview.riskLevel as any);

  return {
    clauseId,
    clauseType: clause.clauseType as any,
    riskLevel: riskReview.riskLevel as any,
    summary: riskReview.summary,
    whyItMatters: riskReview.whyItMatters,
    indiaAngle: riskReview.indiaAngle,
    recommendedAction: riskReview.recommendedAction,
    evidence: evidence.map(e => ({
      sourceType: e.sourceType,
      title: e.title,
      excerpt: e.excerpt,
      citationLabel: e.citationLabel,
      relevanceScore: e.relevanceScore,
    })),
    suggestedRedline: {
      originalText: clause.text,
      suggestedText: redline.suggestedText,
      rationale: redline.rationale,
    },
    verifierStatus: verifierResult.approved ? "approved" as any : "rejected" as any,
    verifierReason: verifierResult.reason,
    negotiationStance: negotiation.stance as any,
    fallbackPosition: negotiation.fallbackPosition,
    talkingPoint: negotiation.talkingPoint,
  };
}
