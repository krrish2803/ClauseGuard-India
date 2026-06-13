import { connectDB } from "./mongodb";
import * as models from "./models";

export { models };
export { connectDB } from "./mongodb";

// Helper function to get DB connection and model
export async function getDB() {
  await connectDB();
  return models;
}

// Re-export all models individually for convenience
export const User = models.User;
export const Account = models.Account;
export const Session = models.Session;
export const VerificationToken = models.VerificationToken;
export const Contract = models.Contract;
export const Clause = models.Clause;
export const ClauseReview = models.ClauseReview;
export const EvidenceSource = models.EvidenceSource;
export const RedlineSuggestion = models.RedlineSuggestion;
export const NegotiationRecommendation = models.NegotiationRecommendation;
export const PlaybookRule = models.PlaybookRule;
export const AgentRun = models.AgentRun;
export const AgentStep = models.AgentStep;
export const Upload = models.Upload;
