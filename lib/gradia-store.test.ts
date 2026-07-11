import { beforeEach, describe, expect, it } from "vitest";
import { getAssessments, saveAssessment, getConsensusRecords, saveConsensusRecord } from "@/lib/gradia-store";
import type { Assessment, ConsensusRecord } from "@/lib/types";

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: "a1",
    title: "Essay 1",
    subject: "History",
    instructions: "",
    objectives: "",
    requirements: "",
    maxScore: 100,
    dueDate: "2026-08-01",
    rubricSummary: "Grade on clarity and evidence.",
    owner: "0xabc",
    status: "open",
    ...overrides,
  };
}

function makeConsensus(overrides: Partial<ConsensusRecord> = {}): ConsensusRecord {
  return {
    assessmentId: "a1",
    submissionId: "s1",
    finalGrade: "B+",
    confidence: 70,
    evidenceVerified: true,
    evidenceUrl: "https://example.com",
    evidenceHashMatched: false,
    verificationNotes: "",
    rubricAlignment: "High",
    learningOutcomeAchievement: "High",
    evidenceQuality: "Medium-High",
    strengths: [],
    improvements: [],
    feedback: "",
    nextSteps: "",
    history: [],
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
});

describe("gradia-store assessments", () => {
  it("persists and retrieves an assessment", () => {
    saveAssessment(makeAssessment());
    expect(getAssessments()).toHaveLength(1);
    expect(getAssessments()[0].title).toBe("Essay 1");
  });

  it("replaces an existing assessment with the same id instead of duplicating it", () => {
    saveAssessment(makeAssessment({ title: "Draft" }));
    saveAssessment(makeAssessment({ title: "Final" }));
    const all = getAssessments();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("Final");
  });
});

describe("gradia-store consensus records", () => {
  it("keeps only one record per assessment/submission pair", () => {
    saveConsensusRecord(makeConsensus({ finalGrade: "C" }));
    saveConsensusRecord(makeConsensus({ finalGrade: "A" }));
    const records = getConsensusRecords();
    expect(records).toHaveLength(1);
    expect(records[0].finalGrade).toBe("A");
  });

  it("keeps separate records for different submissions on the same assessment", () => {
    saveConsensusRecord(makeConsensus({ submissionId: "s1" }));
    saveConsensusRecord(makeConsensus({ submissionId: "s2" }));
    expect(getConsensusRecords()).toHaveLength(2);
  });
});
