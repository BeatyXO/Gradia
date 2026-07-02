import type { RubricCriterion } from "@/lib/types";

export const sampleRubric: RubricCriterion[] = [
  {
    title: "Rubric Alignment",
    weight: 35,
    performance: "Maps each claim to the published assessment criteria.",
    outcome: "Demonstrates mastery of stated learning objectives.",
    evidence: "Specific citations, project artifacts, and public URLs.",
  },
  {
    title: "Reasoning Quality",
    weight: 30,
    performance: "Builds a defensible argument with limitations and counterpoints.",
    outcome: "Shows analytical judgment, not only factual recall.",
    evidence: "Structured explanation and transparent source integration.",
  },
  {
    title: "Communication",
    weight: 20,
    performance: "Uses clear structure, readable prose, and precise terminology.",
    outcome: "Communicates conclusions to educators and students.",
    evidence: "Headings, summaries, and accessible examples.",
  },
  {
    title: "Evidence Integrity",
    weight: 15,
    performance: "Provides public, stable references with reproducible hashes.",
    outcome: "Supports auditability and public accountability.",
    evidence: "Public document URLs, repository links, and content hashes.",
  },
];
