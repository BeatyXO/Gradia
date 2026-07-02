export type Role = "educator" | "student" | "public";

export type TransactionState = "idle" | "wallet" | "pending" | "accepted" | "finalized" | "failed";

export type RubricCriterion = {
  title: string;
  weight: number;
  performance: string;
  outcome: string;
  evidence: string;
};

export type Assessment = {
  id: string;
  title: string;
  subject: string;
  instructions: string;
  objectives: string;
  requirements: string;
  maxScore: number;
  dueDate: string;
  rubricSummary: string;
  owner: string;
  status: "draft" | "open" | "assessing" | "finalized";
  txHash?: string;
};

export type Submission = {
  id: string;
  assessmentId: string;
  title: string;
  url: string;
  hash: string;
  student: string;
  submittedAt: string;
  txHash?: string;
};

export type ConsensusRecord = {
  assessmentId: string;
  submissionId: string;
  finalGrade: string;
  confidence: number;
  rubricAlignment: string;
  learningOutcomeAchievement: string;
  evidenceQuality: string;
  strengths: string[];
  improvements: string[];
  feedback: string;
  nextSteps: string;
  history: string[];
};
