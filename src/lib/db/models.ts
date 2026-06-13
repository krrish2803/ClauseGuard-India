import mongoose, { Schema, Document, Model } from "mongoose";

// ───────────────────────────── Interfaces ─────────────────────────────

// ───────────────────────────── Enums ─────────────────────────────

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type VerifierStatus = "PENDING" | "APPROVED" | "REJECTED";
export type NegotiationStance = "PUSH_HARD" | "NEGOTIABLE" | "STANDARD";
export type AgentStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type ContractStatus = "UPLOADING" | "PARSING" | "REVIEWING" | "COMPLETED" | "FAILED";

// ───────────────────────────── Interfaces ─────────────────────────────

export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccount extends Document {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface ISession extends Document {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

export interface IContract extends Document {
  title: string;
  originalFilename: string;
  fileType?: string;
  fileUrl?: string;
  extractedText?: string;
  status: ContractStatus;
  jurisdictionGuess?: string;
  governingLawGuess?: string;
  isDemo?: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClause extends Document {
  contractId: string;
  clauseNumber: string;
  heading?: string;
  text: string;
  normalizedText?: string;
  clauseType: string;
  startOffset?: number;
  endOffset?: number;
  createdAt: Date;
}

export interface IClauseReview extends Document {
  contractId?: string;
  clauseId: string;
  riskLevel: RiskLevel;
  summary?: string;
  whyItMatters?: string;
  indiaAngle?: string;
  recommendedAction?: string;
  verifierStatus: VerifierStatus;
  verifierReason?: string;
  verifierRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvidenceSource extends Document {
  clauseReviewId: string;
  sourceType: string;
  title: string;
  excerpt: string;
  citationLabel?: string;
  relevanceScore?: number;
  url?: string;
  playbookRuleId?: string;
  ruleName?: string;
  preferredLanguage?: string;
  createdAt: Date;
}

export interface IRedlineSuggestion extends Document {
  clauseReviewId: string;
  originalText?: string;
  suggestedText?: string;
  rationale?: string;
  confidence?: number;
  approvedByVerifier: boolean;
  rejectionReason?: string;
  retrievalQuery?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INegotiationRecommendation extends Document {
  clauseReviewId: string;
  contractId?: string;
  stance: NegotiationStance;
  legalImpact?: string;
  businessImpact?: string;
  fallbackPosition?: string;
  talkingPoint?: string;
  createdAt: Date;
}

export interface IPlaybookRule extends Document {
  clauseType: string;
  preferredLanguage?: string;
  mustHaveTerms?: string;
  fallbackTerms?: string;
  redFlags?: string;
  negotiationPosture?: string;
  indiaNote?: string;
  sampleApprovedWording?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAgentRun extends Document {
  contractId?: string;
  agentName: string;
  status: AgentStatus;
  startedAt?: Date;
  completedAt?: Date;
  inputJson?: string;
  outputJson?: string;
  error?: string;
  createdAt: Date;
}

export interface IAgentStep extends Document {
  runId: string;
  stepName: string;
  status: string;
  input?: string;
  output?: string;
  metadata?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface IUpload extends Document {
  contractId: string;
  fileUrl?: string;
  originalName: string;
  fileType?: string;
  fileSize?: number;
  parsedText?: string;
  parsingStatus: string;
  parsingErrors?: string;
  createdAt: Date;
}



// ───────────────────────────── Schemas ─────────────────────────────

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  role: { type: String, default: "user" },
}, { timestamps: true });

const AccountSchema = new Schema<IAccount>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String },
  access_token: { type: String },
  expires_at: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  id_token: { type: String },
  session_state: { type: String },
});

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const SessionSchema = new Schema<ISession>({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
});

const VerificationTokenSchema = new Schema<IVerificationToken>({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
});

VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

const ContractSchema = new Schema<IContract>({
  title: { type: String, required: true },
  originalFilename: { type: String, required: true },
  fileType: { type: String },
  fileUrl: { type: String },
  extractedText: { type: String },
  status: { type: String, enum: ["UPLOADING", "PARSING", "REVIEWING", "COMPLETED", "FAILED"], default: "UPLOADING" },
  jurisdictionGuess: { type: String },
  governingLawGuess: { type: String },
  isDemo: { type: Boolean, default: false },
  createdById: { type: String, required: true },
}, { timestamps: true });

ContractSchema.index({ createdById: 1 });

const ClauseSchema = new Schema<IClause>({
  contractId: { type: String, required: true },
  clauseNumber: { type: String, required: true },
  heading: { type: String },
  text: { type: String, required: true },
  normalizedText: { type: String },
  clauseType: { type: String, default: "unknown" },
  startOffset: { type: Number },
  endOffset: { type: Number },
}, { timestamps: true });

ClauseSchema.index({ contractId: 1 });

const ClauseReviewSchema = new Schema<IClauseReview>({
  contractId: { type: String },
  clauseId: { type: String, required: true },
  riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  summary: { type: String },
  whyItMatters: { type: String },
  indiaAngle: { type: String },
  recommendedAction: { type: String },
  verifierStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  verifierReason: { type: String },
  verifierRetries: { type: Number, default: 0 },
}, { timestamps: true });

ClauseReviewSchema.index({ clauseId: 1 });

const EvidenceSourceSchema = new Schema<IEvidenceSource>({
  clauseReviewId: { type: String, required: true },
  sourceType: { type: String, default: "playbook" },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  citationLabel: { type: String },
  relevanceScore: { type: Number, default: 0 },
  url: { type: String },
  playbookRuleId: { type: String },
  ruleName: { type: String },
  preferredLanguage: { type: String },
}, { timestamps: true });

EvidenceSourceSchema.index({ clauseReviewId: 1 });

const RedlineSuggestionSchema = new Schema<IRedlineSuggestion>({
  clauseReviewId: { type: String, required: true },
  originalText: { type: String },
  suggestedText: { type: String },
  rationale: { type: String },
  confidence: { type: Number },
  approvedByVerifier: { type: Boolean, default: false },
  rejectionReason: { type: String },
  retrievalQuery: { type: String },
  version: { type: Number, default: 1 },
}, { timestamps: true });

RedlineSuggestionSchema.index({ clauseReviewId: 1 });

const NegotiationRecommendationSchema = new Schema<INegotiationRecommendation>({
  clauseReviewId: { type: String, required: true },
  contractId: { type: String },
  stance: { type: String, enum: ["PUSH_HARD", "NEGOTIABLE", "STANDARD"], default: "NEGOTIABLE" },
  legalImpact: { type: String },
  businessImpact: { type: String },
  fallbackPosition: { type: String },
  talkingPoint: { type: String },
}, { timestamps: true });

NegotiationRecommendationSchema.index({ clauseReviewId: 1 });

const PlaybookRuleSchema = new Schema<IPlaybookRule>({
  clauseType: { type: String, required: true, unique: true },
  preferredLanguage: { type: String },
  mustHaveTerms: { type: String },
  fallbackTerms: { type: String },
  redFlags: { type: String },
  negotiationPosture: { type: String },
  indiaNote: { type: String },
  sampleApprovedWording: { type: String },
}, { timestamps: true });

const AgentRunSchema = new Schema<IAgentRun>({
  contractId: { type: String },
  agentName: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED"], default: "PENDING" },
  startedAt: { type: Date },
  completedAt: { type: Date },
  inputJson: { type: String },
  outputJson: { type: String },
  error: { type: String },
}, { timestamps: true });

AgentRunSchema.index({ contractId: 1 });

const AgentStepSchema = new Schema<IAgentStep>({
  runId: { type: String, required: true },
  stepName: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  input: { type: String },
  output: { type: String },
  metadata: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

AgentStepSchema.index({ runId: 1 });

const UploadSchema = new Schema<IUpload>({
  contractId: { type: String, required: true, unique: true },
  fileUrl: { type: String },
  originalName: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  parsedText: { type: String },
  parsingStatus: { type: String, default: "PENDING" },
  parsingErrors: { type: String },
}, { timestamps: true });

// ───────────────────────────── Models ─────────────────────────────

export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export const Account = (mongoose.models.Account as Model<IAccount>) || mongoose.model<IAccount>("Account", AccountSchema);
export const Session = (mongoose.models.Session as Model<ISession>) || mongoose.model<ISession>("Session", SessionSchema);
export const VerificationToken = (mongoose.models.VerificationToken as Model<IVerificationToken>) || mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
export const Contract = (mongoose.models.Contract as Model<IContract>) || mongoose.model<IContract>("Contract", ContractSchema);
export const Clause = (mongoose.models.Clause as Model<IClause>) || mongoose.model<IClause>("Clause", ClauseSchema);
export const ClauseReview = (mongoose.models.ClauseReview as Model<IClauseReview>) || mongoose.model<IClauseReview>("ClauseReview", ClauseReviewSchema);
export const EvidenceSource = (mongoose.models.EvidenceSource as Model<IEvidenceSource>) || mongoose.model<IEvidenceSource>("EvidenceSource", EvidenceSourceSchema);
export const RedlineSuggestion = (mongoose.models.RedlineSuggestion as Model<IRedlineSuggestion>) || mongoose.model<IRedlineSuggestion>("RedlineSuggestion", RedlineSuggestionSchema);
export const NegotiationRecommendation = (mongoose.models.NegotiationRecommendation as Model<INegotiationRecommendation>) || mongoose.model<INegotiationRecommendation>("NegotiationRecommendation", NegotiationRecommendationSchema);
export const PlaybookRule = (mongoose.models.PlaybookRule as Model<IPlaybookRule>) || mongoose.model<IPlaybookRule>("PlaybookRule", PlaybookRuleSchema);
export const AgentRun = (mongoose.models.AgentRun as Model<IAgentRun>) || mongoose.model<IAgentRun>("AgentRun", AgentRunSchema);
export const AgentStep = (mongoose.models.AgentStep as Model<IAgentStep>) || mongoose.model<IAgentStep>("AgentStep", AgentStepSchema);
export const Upload = (mongoose.models.Upload as Model<IUpload>) || mongoose.model<IUpload>("Upload", UploadSchema);
