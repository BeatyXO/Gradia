import { describe, expect, it } from "vitest";
import { consensusRecordFromReceipt } from "@/lib/genlayer";

function encodeResult(payload: unknown) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const withLeader = new Uint8Array(bytes.length + 1);
  withLeader[0] = 0;
  withLeader.set(bytes, 1);
  return Buffer.from(withLeader).toString("base64");
}

const validPayload = {
  finalGrade: "A-",
  confidence: 87,
  evidenceVerified: true,
  evidenceUrl: "https://example.com/work",
  evidenceHashMatched: true,
  verificationNotes: "Checked.",
  rubricAlignment: "High",
  learningOutcomeAchievement: "High",
  evidenceQuality: "High",
  strengths: ["Clear reasoning"],
  improvements: ["More citations"],
  feedback: "Solid work.",
  nextSteps: "Add references.",
  history: ["Fetched evidence and graded against rubric."],
};

describe("consensusRecordFromReceipt", () => {
  it("decodes the result from the first agreeing validator", () => {
    const receipt = {
      consensus_data: {
        validators: [
          { vote: "disagree", result: encodeResult({ finalGrade: "F" }) },
          { vote: "agree", result: encodeResult(validPayload) },
        ],
      },
    };

    const record = consensusRecordFromReceipt(receipt, "assessment-1", "submission-1");

    expect(record).not.toBeNull();
    expect(record?.finalGrade).toBe("A-");
    expect(record?.confidence).toBe(87);
    expect(record?.assessmentId).toBe("assessment-1");
    expect(record?.submissionId).toBe("submission-1");
  });

  it("returns null when no validator agreed", () => {
    const receipt = {
      consensus_data: {
        validators: [{ vote: "disagree", result: encodeResult(validPayload) }],
      },
    };

    expect(consensusRecordFromReceipt(receipt, "assessment-1", "submission-1")).toBeNull();
  });

  it("returns null when the receipt has no consensus data", () => {
    expect(consensusRecordFromReceipt({}, "assessment-1", "submission-1")).toBeNull();
  });

  it("returns null for malformed base64 result payloads", () => {
    const receipt = {
      consensus_data: {
        validators: [{ vote: "agree", result: "not-valid-base64!!" }],
      },
    };

    expect(consensusRecordFromReceipt(receipt, "assessment-1", "submission-1")).toBeNull();
  });
});
