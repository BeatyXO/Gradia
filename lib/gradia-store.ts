"use client";

import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

const ASSESSMENT_KEY = "gradia.assessments";
const SUBMISSION_KEY = "gradia.submissions";
const CONSENSUS_KEY = "gradia.consensus";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function storage() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage;
    const probeKey = "gradia.storage.probe";
    value.setItem(probeKey, "1");
    value.removeItem(probeKey);
    return value;
  } catch {
    return null;
  }
}

function readCookie(key: string) {
  if (typeof document === "undefined") return null;
  const encodedKey = encodeURIComponent(key) + "=";
  const item = document.cookie.split("; ").find((part) => part.startsWith(encodedKey));
  if (!item) return null;
  return decodeURIComponent(item.slice(encodedKey.length));
}

function writeCookie<T>(key: string, value: T) {
  if (typeof document === "undefined") return;
  const encodedValue = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${encodeURIComponent(key)}=${encodedValue}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = storage()?.getItem(key) ?? readCookie(key);
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
    const next = JSON.stringify(value);
    const store = storage();
    if (store) {
      store.setItem(key, next);
    }
    writeCookie(key, value);
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
