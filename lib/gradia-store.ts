"use client";

import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

const ASSESSMENT_KEY = "gradia.assessments";
const SUBMISSION_KEY = "gradia.submissions";
const CONSENSUS_KEY = "gradia.consensus";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

const CHANGE_EVENT = "gradia:store-change";

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

/** Calls `callback` whenever any Gradia record is saved, in this tab or another. Returns an unsubscribe function. */
export function subscribeToStoreChanges(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getAssessments() {
  return read<Assessment[]>(ASSESSMENT_KEY, []);
}

export function getAssessment(id: string) {
  return getAssessments().find((item) => item.id === id);
}

export function saveAssessment(assessment: Assessment) {
  const next = [assessment, ...getAssessments().filter((item) => item.id !== assessment.id)];
  write(ASSESSMENT_KEY, next);
  return next;
}

export function getSubmissions() {
  return read<Submission[]>(SUBMISSION_KEY, []);
}

export function getSubmission(id: string) {
  return getSubmissions().find((item) => item.id === id);
}

export function saveSubmission(submission: Submission) {
  const next = [submission, ...getSubmissions().filter((item) => item.id !== submission.id)];
  write(SUBMISSION_KEY, next);
  return next;
}

export function getConsensusRecords() {
  return read<ConsensusRecord[]>(CONSENSUS_KEY, []);
}

export function getConsensusRecord(assessmentId: string, submissionId: string) {
  return getConsensusRecords().find((item) => item.assessmentId === assessmentId && item.submissionId === submissionId);
}

export function saveConsensusRecord(record: ConsensusRecord) {
  const next = [
    record,
    ...getConsensusRecords().filter((item) => !(item.assessmentId === record.assessmentId && item.submissionId === record.submissionId)),
  ];
  write(CONSENSUS_KEY, next);
  return next;
}
