"use client";

import { useEffect, useState } from "react";
import { Cable, FilePlus2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { requestConsensusOnChain, readConsensusRecord, waitForAccepted } from "@/lib/genlayer";
import { getAssessments, getSubmissions, saveConsensusRecord, subscribeToStoreChanges } from "@/lib/gradia-store";
import { describeError, explorerUrl } from "@/lib/utils";
import type { Assessment, Submission, TransactionState } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function ContractPanel() {
  const [state, setState] = useState<TransactionState>("idle");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("Enter an assessment ID and submission ID that already exist on-chain, then request consensus.");
  const [assessmentId, setAssessmentId] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    function refresh() {
      const nextAssessments = getAssessments();
      const nextSubmissions = getSubmissions();
      setAssessments(nextAssessments);
      setSubmissions(nextSubmissions);
      setAssessmentId((current) => current || nextAssessments[0]?.id || "");
      setSubmissionId((current) => current || nextSubmissions[0]?.id || "");
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  async function requestConsensus() {
    if (!assessmentId || !submissionId) {
      setMessage("Enter both an assessment ID and a submission ID.");
      return;
    }
    try {
      setState("wallet");
      if (!window.ethereum) throw new Error("Injected wallet not found.");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No wallet account selected.");

      setState("pending");
      const hash = await requestConsensusOnChain(account, window.ethereum, assessmentId, submissionId);
      setTxHash(hash);
      setState("accepted");
      setMessage("Transaction submitted. Click \"Wait for Accepted Receipt\" to confirm and fetch the grade.");
    } catch (error) {
      console.error("Request AI Assessment failed:", error);
      setState("failed");
      setMessage(describeError(error));
    }
  }

  async function waitForReceipt() {
    try {
      if (!txHash) return;
      setState("pending");
      await waitForAccepted(txHash);

      const record = await readConsensusRecord(assessmentId, submissionId);
      if (record) {
        saveConsensusRecord({ ...record, assessmentId, submissionId });
      }

      setState("finalized");
      setMessage(record ? `Receipt accepted. Final grade: ${record.finalGrade} (${record.confidence}% confidence).` : "Receipt accepted, but no consensus record was returned.");
    } catch (error) {
      console.error("Wait for Accepted Receipt failed:", error);
      setState("failed");
      setMessage(describeError(error));
    }
  }

  return (
    <section className="panel grid gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#6E3482]">GenLayer StudioNet</p>
          <h2 className="text-2xl font-black text-[#49225B]">Contract Interaction Panel</h2>
        </div>
        <StatusPill state={state} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <Cable className="h-5 w-5 text-[#6E3482]" />
          <p className="mt-2 text-sm font-black">Network</p>
          <p className="text-sm text-[#49225B]/70">StudioNet · GEN</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <FilePlus2 className="h-5 w-5 text-[#6E3482]" />
          <p className="mt-2 text-sm font-black">Contract</p>
          <p className="truncate text-sm text-[#49225B]/70">{process.env.NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS || "Not configured"}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-[#6E3482]" />
          <p className="mt-2 text-sm font-black">SDK</p>
          <p className="text-sm text-[#49225B]/70">genlayer-js 1.1.8</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Assessment (must already exist on-chain)</span>
          {assessments.length === 0 ? (
            <input className="field" disabled placeholder="No local assessments — create one first" />
          ) : (
            <select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)} className="field">
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.id} · {assessment.title}
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          <span className="label">Submission (must already exist on-chain)</span>
          {submissions.length === 0 ? (
            <input className="field" disabled placeholder="No local submissions — register one first" />
          ) : (
            <select value={submissionId} onChange={(event) => setSubmissionId(event.target.value)} className="field">
              {submissions.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {submission.id} · {submission.title}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>
      <p className="rounded-md bg-white p-4 text-sm font-semibold text-[#49225B]/80">{message}</p>
      {txHash ? (
        <a href={explorerUrl(txHash)} className="break-all text-sm font-black text-[#6E3482]">
          {txHash}
        </a>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={requestConsensus} disabled={state === "wallet" || state === "pending"}>
          <ShieldCheck className="h-4 w-4" />
          Request AI Assessment
        </Button>
        <Button onClick={waitForReceipt} variant="secondary" disabled={!txHash}>
          <RefreshCw className="h-4 w-4" />
          Wait for Accepted Receipt
        </Button>
      </div>
    </section>
  );
}
