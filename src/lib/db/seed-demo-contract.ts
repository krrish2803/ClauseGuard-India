import { connectDB } from "./mongodb";
import {
  Contract, Clause, ClauseReview, EvidenceSource,
  RedlineSuggestion, NegotiationRecommendation, AgentRun, User, PlaybookRule,
} from "./models";

const DEMO_CONTRACT_TEXT = `MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into on this 1st day of January, 2025 by and between:

Acme Technologies Pvt Ltd, a company incorporated under the Companies Act, 2013, having its registered office at Brigade Road, Bengaluru, Karnataka 560001 (hereinafter "Company" or "Customer")

AND

Vendor Solutions India Pvt Ltd, a company incorporated under the Companies Act, 2013, having its registered office at Hitech City, Hyderabad, Telangana 500081 (hereinafter "Provider" or "Vendor")

1. SERVICES
Provider shall provide the services described in individual Statements of Work (SOWs) executed by both parties. Each SOW shall be governed by this Agreement.

2. PAYMENT TERMS
Customer shall pay Provider the fees as set forth in the applicable SOW. Payment terms shall be as mutually agreed between the parties from time to time. Provider reserves the right to modify fees upon 30 days notice.

3. CONFIDENTIALITY
Each Party agrees to hold the other Party's Confidential Information in confidence. Confidential Information shall not be disclosed to any third party without the prior written consent of the Disclosing Party. This obligation shall survive termination of this Agreement.

4. DATA PROTECTION
Provider may process Customer data as necessary to perform the Services. Provider shall implement reasonable security measures to protect Customer data.

5. INTELLECTUAL PROPERTY
All work product, deliverables, and intellectual property created by Provider in connection with the Services shall be owned by Provider. Customer is granted a non-exclusive, royalty-free license to use the deliverables for its internal business purposes.

6. LIMITATION OF LIABILITY
NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES. EACH PARTY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE LIMITED TO THE TOTAL FEES PAID BY CUSTOMER TO PROVIDER IN THE PRECEDING 3 MONTHS.

7. TERMINATION
Provider may terminate this Agreement or any SOW at any time without cause upon 30 days written notice. Customer may terminate this Agreement only for material breach by Provider that remains uncured for 60 days. Upon termination for any reason, Provider shall have no obligation to return or transfer any Customer data or work product.

8. GOVERNING LAW
This Agreement shall be governed by the laws of Singapore. The parties submit to the jurisdiction of the Singapore International Commercial Court.

9. INDEMNIFICATION
Provider shall indemnify Customer against claims that the Services infringe third party intellectual property rights. This indemnity is Provider's sole obligation and Customer's exclusive remedy for IP infringement claims.

10. WARRANTY
Provider warrants that the Services will be performed in a workmanlike manner. ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, ARE EXCLUDED TO THE MAXIMUM EXTENT PERMITTED BY LAW.`;

const clauses = [
  {
    clauseNumber: "2",
    heading: "Payment Terms",
    text: "Customer shall pay Provider the fees as set forth in the applicable SOW. Payment terms shall be as mutually agreed between the parties from time to time. Provider reserves the right to modify fees upon 30 days notice.",
    clauseType: "payment",
    startOffset: 0,
    endOffset: 3,
    riskLevel: "MEDIUM" as const,
    summary: "Payment terms are vague and one-sided. Provider can modify fees on 30 days notice without Customer consent, creating budget uncertainty. No late payment interest, invoicing schedule, or tax handling specified.",
    whyItMatters: "Vague payment terms expose Customer to unexpected price increases. Without a fixed fee schedule or rate card, the Provider can unilaterally change pricing.",
    indiaAngle: "Under Indian Contract Act, consideration must be certain. Unilateral price modification clauses may be challenged as unconscionable. TDS and GST obligations are not addressed.",
    recommendedAction: "Fix the fee schedule in the SOW, require mutual consent for price changes, add 30-day payment terms with 1.5% monthly late interest, and specify GST and TDS responsibilities.",
    redlineSuggested: "Fees shall be as set forth in each SOW and shall remain fixed for the duration of such SOW. Either Party may propose fee changes for new SOWs. Invoices shall be paid within 30 days of receipt. Late payments shall accrue interest at 1.5% per month.",
    redlineRationale: "This ensures price certainty for the duration of each SOW while preserving flexibility for new engagements. Late interest incentivizes timely payment.",
    evidenceTitle: "Playbook Rule: Payment Terms",
    evidenceRuleName: "Market Standard Payment Terms",
    evidencePreferredLanguage: "Customer shall pay Provider the fees as set forth in the applicable SOW. Invoices shall be paid within 30 days of receipt.",
    stance: "PUSH_HARD" as const,
    legalImpact: "Without fixed pricing, Customer faces uncapped cost exposure. Unilateral modification may be unenforceable under Indian Contract Act.",
    businessImpact: "Budget unpredictability makes financial planning impossible. Competitors may offer more favorable fixed-price terms.",
    fallbackPosition: "Accept 30-day notice for fee changes but require mutual agreement for existing SOWs.",
    talkingPoint: "We need pricing certainty for each SOW. A 30-day unilateral change clause is standard for ongoing subscriptions but not for fixed-scope projects. Let's lock rates per SOW.",
  },
  {
    clauseNumber: "3",
    heading: "Confidentiality",
    text: "Each Party agrees to hold the other Party's Confidential Information in confidence. Confidential Information shall not be disclosed to any third party without the prior written consent of the Disclosing Party. This obligation shall survive termination of this Agreement.",
    clauseType: "confidentiality",
    startOffset: 4,
    endOffset: 7,
    riskLevel: "LOW" as const,
    summary: "Standard mutual confidentiality clause with basic protections. Core obligations are present but lacks specificity on duration, exclusions, and permitted disclosures.",
    whyItMatters: "Confidentiality is the foundation of trust in vendor relationships. While functional, this clause lacks the specificity needed for complex engagements.",
    indiaAngle: "Indian courts require confidentiality clauses to be specific. Section 72A of IT Act provides statutory protection. DPDP Act requires additional safeguards for personal data.",
    recommendedAction: "Add 5-year survival period, exclusions for publicly available information, return/destruction obligation, and carve-out for regulatory disclosures.",
    redlineSuggested: "Each Party shall hold the other's Confidential Information in confidence for 5 years from termination. Exclusions apply for publicly available information, independently developed information, and information required to be disclosed by law.",
    redlineRationale: "Specific survival period aligns with Indian market practice. Exclusions prevent overreach and clarify that legal disclosures are permitted.",
    evidenceTitle: "Playbook Rule: Confidentiality",
    evidenceRuleName: "Market Standard Confidentiality",
    evidencePreferredLanguage: "Recipient shall maintain Confidential Information in strict confidence for a minimum of 3 years post-termination.",
    stance: "STANDARD" as const,
    legalImpact: "Adequate for basic protection but insufficient for sensitive data sharing.",
    businessImpact: "Low risk. Functions adequately for standard business arrangements.",
    fallbackPosition: "Current language is acceptable for low-risk engagements.",
    talkingPoint: "The confidentiality clause is reasonable. We may want to strengthen the survival period for longer-term engagements.",
  },
  {
    clauseNumber: "4",
    heading: "Data Protection",
    text: "Provider may process Customer data as necessary to perform the Services. Provider shall implement reasonable security measures to protect Customer data.",
    clauseType: "data_protection",
    startOffset: 8,
    endOffset: 10,
    riskLevel: "HIGH" as const,
    summary: "CRITICAL: No reference to DPDP Act 2023, no data localization, no breach notification, no data principal rights. This clause is completely inadequate under Indian data protection law.",
    whyItMatters: "Non-compliance with DPDP Act can result in penalties up to INR 250 crore. Personal data of employees, customers, and vendors is being processed without proper safeguards or legal framework.",
    indiaAngle: "DPDP Act 2023 requires: consent before processing, notice specifying purpose, data principal rights (access, correction, erasure), 72-hour breach notification to Data Protection Board, and data localization for notified classes of data.",
    recommendedAction: "Add comprehensive data protection clause referencing DPDP Act 2023, including breach notification (24-72 hours), data processing limitations, data principal rights, audit rights, and data return/deletion obligations.",
    redlineSuggested: "Provider shall process Personal Data solely to perform the Services and in full compliance with DPDP Act, 2023 and IT Act, 2000. Provider shall: (a) implement encryption, access controls, and security audits; (b) notify Customer within 24 hours of any data breach; (c) return or destroy all Customer data within 30 days of termination; (d) maintain a data processing register.",
    redlineRationale: "Brings the agreement into DPDP Act compliance. 24-hour notification exceeds the statutory 72-hour requirement, giving Customer early warning. Data return/deletion ensures data sovereignty.",
    evidenceTitle: "Playbook Rule: Data Protection",
    evidenceRuleName: "DPDP Act Compliance Required",
    evidencePreferredLanguage: "Each Party shall comply with DPDP Act, 2023. Personal Data shall be processed only for the specified purpose with appropriate security measures.",
    stance: "PUSH_HARD" as const,
    legalImpact: "Exposes Customer to regulatory penalties up to INR 250 crore under DPDP Act. No contractual remedy for data breaches.",
    businessImpact: "Reputational risk from data breaches. Inability to demonstrate DPDP compliance to regulators. May affect Customer's own compliance obligations.",
    fallbackPosition: "Minimum: add DPDP Act reference, 72-hour breach notification, and data return obligation.",
    talkingPoint: "Your data protection clause doesn't reference the DPDP Act at all — this is a critical gap. We need full DPDP compliance language, breach notification, and data return rights. This is non-negotiable given the penalty exposure.",
  },
  {
    clauseNumber: "5",
    heading: "Intellectual Property",
    text: "All work product, deliverables, and intellectual property created by Provider in connection with the Services shall be owned by Provider. Customer is granted a non-exclusive, royalty-free license to use the deliverables for its internal business purposes.",
    clauseType: "ip_ownership",
    startOffset: 11,
    endOffset: 14,
    riskLevel: "HIGH" as const,
    summary: "Provider retains ALL IP ownership of work product. Customer gets only a license to use deliverables. This means Customer cannot switch vendors without losing their data and customizations.",
    whyItMatters: "Customer is paying for development but gets no ownership. This creates vendor lock-in — if Customer terminates, they lose all work product including custom configurations, reports, and integrations.",
    indiaAngle: "Under Indian Copyright Act 1957, works created under contract belong to the contractor unless there is a written assignment. The current clause explicitly assigns to Provider, which is enforceable but highly unfavorable to Customer.",
    recommendedAction: "Reverse IP ownership: all work product shall belong to Customer with Provider retaining a license for pre-existing IP. Add assignment clause and IP warranty.",
    redlineSuggested: "All Intellectual Property Rights in the Deliverables shall vest exclusively with Customer. Provider hereby assigns all rights, title, and interest in the Deliverables. Provider retains ownership of pre-existing IP and grants Customer a perpetual license to use pre-existing IP incorporated in the deliverables.",
    redlineRationale: "Standard industry practice — Customer pays for development and owns the result. Provider is compensated through fees and retains rights to their pre-existing tools.",
    evidenceTitle: "Playbook Rule: IP Ownership",
    evidenceRuleName: "Customer Ownership Standard",
    evidencePreferredLanguage: "All IP in the Deliverables shall vest exclusively with the Customer. Provider assigns all rights in the Deliverables to the Customer.",
    stance: "PUSH_HARD" as const,
    legalImpact: "Customer has no ownership of paid work product. If Provider becomes insolvent or is acquired, Customer's access to deliverables is at risk.",
    businessImpact: "Vendor lock-in. Customer cannot migrate to another provider without rebuilding all work product from scratch. Reduces negotiation leverage with Provider.",
    fallbackPosition: "Joint ownership of deliverables with mutual license rights. Provider retains ownership but grants Customer a perpetual, irrevocable license.",
    talkingPoint: "We're paying for the development but you keep ownership. That's not workable — we need assignment of deliverables to us with you keeping your pre-existing tools. This is standard across the industry.",
  },
  {
    clauseNumber: "6",
    heading: "Limitation of Liability",
    text: "NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES. EACH PARTY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE LIMITED TO THE TOTAL FEES PAID BY CUSTOMER TO PROVIDER IN THE PRECEDING 3 MONTHS.",
    clauseType: "limitation_of_liability",
    startOffset: 15,
    endOffset: 19,
    riskLevel: "HIGH" as const,
    summary: "Liability cap is severely inadequate — 3 months of fees may be negligible for a large project. No carve-outs for confidentiality breach, IP infringement, data protection, or willful misconduct.",
    whyItMatters: "If Provider loses Customer's data, or breaches confidentiality, or infringes third party IP, Customer's recovery is limited to 3 months fees — which could be far less than the actual damages.",
    indiaAngle: "Indian courts under Contract Act generally uphold liability caps. However, unlimited liability for data breaches is becoming market standard due to DPDP Act penalty exposure (up to INR 250 crore). Exception for fraud and willful misconduct.",
    recommendedAction: "Increase cap to 12 months fees. Add carve-outs for: confidentiality breach, data protection breach, IP infringement, willful misconduct, gross negligence, and indemnification obligations.",
    redlineSuggested: "Each Party's aggregate liability shall not exceed the fees paid in the preceding 12 months. This cap shall not apply to: (a) breach of confidentiality, (b) data protection obligations, (c) IP infringement indemnity, (d) gross negligence or willful misconduct, (e) breach of indemnification obligations.",
    redlineRationale: "12-month cap aligns with Indian IT market standard. Carve-outs ensure that fundamental obligations (confidentiality, data protection) have meaningful remedies.",
    evidenceTitle: "Playbook Rule: Limitation of Liability",
    evidenceRuleName: "Market Standard Liability Cap",
    evidencePreferredLanguage: "Liability cap shall be 12 months fees with carve-outs for confidentiality, data protection, IP infringement, and willful misconduct.",
    stance: "PUSH_HARD" as const,
    legalImpact: "3-month cap is below market standard and may be insufficient to cover damages from data breaches (DPDP penalties up to INR 250 crore).",
    businessImpact: "Inadequate insurance coverage gap. If Provider causes significant harm, Customer bears the loss beyond 3 months fees.",
    fallbackPosition: "Minimum 6-month cap with carve-outs for data breach and IP infringement.",
    talkingPoint: "A 3-month liability cap is not workable, especially for data protection. DPDP Act penalties alone can reach INR 250 crore. We need at minimum a 12-month cap with proper carve-outs for confidentiality, data breach, and IP infringement.",
  },
  {
    clauseNumber: "7",
    heading: "Termination",
    text: "Provider may terminate this Agreement or any SOW at any time without cause upon 30 days written notice. Customer may terminate this Agreement only for material breach by Provider that remains uncured for 60 days. Upon termination for any reason, Provider shall have no obligation to return or transfer any Customer data or work product.",
    clauseType: "termination",
    startOffset: 20,
    endOffset: 24,
    riskLevel: "HIGH" as const,
    summary: "Highly one-sided: Provider can terminate for convenience with 30 days notice, but Customer can only terminate for cause. No data return obligation — Customer loses all data and work product upon termination.",
    whyItMatters: "Provider can walk away with 30 days notice, leaving Customer with no services and no data. Customer has no right to terminate for convenience even with notice. This creates unacceptable business continuity risk.",
    indiaAngle: "Indian Contract Act permits parties to agree on termination terms. Courts generally uphold these provisions. However, the complete lack of data return obligation may conflict with DPDP Act requirements for data deletion upon termination of processing purpose.",
    recommendedAction: "Make termination mutual (either party can terminate for convenience with 30-60 days notice). Add data return/deletion obligation within 30 days. Add transition assistance period of 60-90 days.",
    redlineSuggested: "Either Party may terminate this Agreement upon 30 days written notice. Provider shall provide 60 days transition assistance. Within 30 days of termination, Provider shall return all Customer data in machine-readable format and destroy copies, certifying in writing.",
    redlineRationale: "Mutual termination creates balance. Data return ensures Customer can transition to another provider. Transition assistance prevents service disruption.",
    evidenceTitle: "Playbook Rule: Termination",
    evidenceRuleName: "Mutual Termination Standard",
    evidencePreferredLanguage: "Either Party may terminate with 30 days notice. Provider shall provide transition assistance and return/destroy all Customer data within 30 days.",
    stance: "PUSH_HARD" as const,
    legalImpact: "Data retention post-termination without obligation to return violates DPDP Act. Unilateral termination right may be unconscionable.",
    businessImpact: "Business continuity risk — Provider can terminate with minimal notice. No data portability means Customer is locked in.",
    fallbackPosition: "Mutual 60-day termination for convenience. 30-day data return with reasonable transition assistance.",
    talkingPoint: "You can terminate with 30 days notice but we can only terminate for breach? And you keep our data? That's not balanced. We need mutual termination rights, data return, and transition assistance. This is a fundamental business continuity issue.",
  },
  {
    clauseNumber: "8",
    heading: "Governing Law",
    text: "This Agreement shall be governed by the laws of Singapore. The parties submit to the jurisdiction of the Singapore International Commercial Court.",
    clauseType: "governing_law",
    startOffset: 25,
    endOffset: 27,
    riskLevel: "MEDIUM" as const,
    summary: "This is an India-centric contract between two Indian companies but chooses Singapore law and courts. This adds significant cost and complexity for dispute resolution.",
    whyItMatters: "Two Indian companies litigating in Singapore courts means higher legal costs, travel expenses, and unfamiliar legal procedures. Singapore law may not provide the same protections as Indian law.",
    indiaAngle: "Indian courts strongly prefer Indian governing law for domestic contracts. Recent decisions have narrowed the scope for foreign law. The Singapore International Commercial Court has jurisdiction but enforcement in India would require compliance with CPC.",
    recommendedAction: "Change governing law to India with courts in Bengaluru or Hyderabad. If Provider insists on Singapore arbitration, use SIAC rules with Indian governing law.",
    redlineSuggested: "This Agreement shall be governed by the laws of India. The courts at Bengaluru shall have exclusive jurisdiction. Alternatively, disputes may be finally settled by arbitration in Mumbai under SIAC Rules.",
    redlineRationale: "Indian governing law for an India-India contract is standard. Arbitration preserves neutrality if that's a concern, but at lower cost than Singapore court litigation.",
    evidenceTitle: "Playbook Rule: Governing Law",
    evidenceRuleName: "Indian Governing Law Required",
    evidencePreferredLanguage: "This Agreement shall be governed by the laws of India. Courts in [City], India shall have exclusive jurisdiction.",
    stance: "PUSH_HARD" as const,
    legalImpact: "Enforcing Singapore judgments in India requires compliance with CPC, adding months of delay. Indian substantive law may differ significantly.",
    businessImpact: "Litigation costs 3-5x higher in Singapore. In-house legal teams unfamiliar with Singapore procedure. No access to Indian small causes courts.",
    fallbackPosition: "SIAC arbitration seated in Mumbai with Indian governing law.",
    talkingPoint: "We're both Indian companies — why Singapore law? This adds enormous cost if we ever have a dispute. Let's use Indian law with courts in Bengaluru, or at minimum SIAC arbitration in Mumbai with Indian governing law.",
  },
];

export async function seedDemoContract() {
  await connectDB();

  const existing = await Contract.findOne({ isDemo: true });
  if (existing) {
    console.log("Demo contract already exists, skipping.");
    return;
  }

  const user = await User.findOne();
  if (!user) {
    console.log("No users found — run auth seed first.");
    return;
  }

  const contract = await Contract.create({
    title: "Demo — Indian MSA (Acme Technologies vs Vendor Solutions)",
    originalFilename: "demo-msa-acme-vendor.pdf",
    fileType: "txt",
    extractedText: DEMO_CONTRACT_TEXT,
    status: "COMPLETED",
    jurisdictionGuess: "India",
    governingLawGuess: "India",
    isDemo: true,
    createdById: user._id.toString(),
  });

  const contractId = contract._id.toString();

  for (const c of clauses) {
    const clause = await Clause.create({
      contractId,
      clauseNumber: c.clauseNumber,
      heading: c.heading,
      text: c.text,
      normalizedText: c.text.toLowerCase().replace(/\s+/g, " "),
      clauseType: c.clauseType,
      startOffset: c.startOffset,
      endOffset: c.endOffset,
    });

    const clauseId = clause._id.toString();

    const review = await ClauseReview.create({
      contractId,
      clauseId,
      riskLevel: c.riskLevel,
      summary: c.summary,
      whyItMatters: c.whyItMatters,
      indiaAngle: c.indiaAngle,
      recommendedAction: c.recommendedAction,
      verifierStatus: "APPROVED",
      verifierReason: "Redline approved by AI verifier.",
      verifierRetries: 0,
    });

    const reviewId = review._id.toString();

    const playbookRule = await PlaybookRule.findOne({ clauseType: c.clauseType });

    await EvidenceSource.create({
      clauseReviewId: reviewId,
      sourceType: "playbook_rule",
      title: c.evidenceTitle,
      excerpt: c.evidencePreferredLanguage,
      citationLabel: c.clauseType,
      relevanceScore: 0.92,
      playbookRuleId: playbookRule?._id.toString(),
      ruleName: c.evidenceRuleName,
      preferredLanguage: c.evidencePreferredLanguage,
    });

    await RedlineSuggestion.create({
      clauseReviewId: reviewId,
      originalText: c.text,
      suggestedText: c.redlineSuggested,
      rationale: c.redlineRationale,
      confidence: 0.88,
      approvedByVerifier: true,
      version: 1,
    });

    await NegotiationRecommendation.create({
      clauseReviewId: reviewId,
      contractId,
      stance: c.stance,
      legalImpact: c.legalImpact,
      businessImpact: c.businessImpact,
      fallbackPosition: c.fallbackPosition,
      talkingPoint: c.talkingPoint,
    });
  }

  // Create realistic agent run timings (simulating a real pipeline execution)
  const baseTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  const agentTimings = [
    { agentName: "ingestion", durationMs: 800 },
    { agentName: "segmentation", durationMs: 1200 },
    { agentName: "classification", durationMs: 2100 },
    { agentName: "retrieval", durationMs: 3400 },
    { agentName: "risk_review", durationMs: 4200 },
    { agentName: "redline", durationMs: 3800 },
    { agentName: "verifier", durationMs: 1100 },
    { agentName: "negotiation_coach", durationMs: 2300 },
  ];

  let currentTime = baseTime;
  for (const timing of agentTimings) {
    const startedAt = new Date(currentTime);
    const completedAt = new Date(startedAt.getTime() + timing.durationMs);
    
    await AgentRun.create({
      contractId,
      agentName: timing.agentName,
      status: "COMPLETED",
      startedAt,
      completedAt,
      inputJson: JSON.stringify({ contractId, agent: timing.agentName }),
      outputJson: JSON.stringify({ 
        status: "COMPLETED",
        ...(timing.agentName === "ingestion" && { extractedTextLength: DEMO_CONTRACT_TEXT.length }),
        ...(timing.agentName === "segmentation" && { clauseCount: clauses.length }),
        ...(timing.agentName === "classification" && { classifiedCount: clauses.length }),
        ...(timing.agentName === "retrieval" && { evidenceFound: clauses.length }),
        ...(timing.agentName === "risk_review" && { reviewedCount: clauses.length }),
        ...(timing.agentName === "redline" && { redlinesGenerated: clauses.length }),
        ...(timing.agentName === "verifier" && { approved: clauses.length, rejected: 0, retries: 0 }),
        ...(timing.agentName === "negotiation_coach" && { recommendationsGenerated: clauses.length }),
      }),
    });
    
    currentTime = completedAt;
  }

  console.log(`Demo contract seeded: ${contract.title} (${clauses.length} clauses, ${agentTimings.length} agent runs)`);
}
