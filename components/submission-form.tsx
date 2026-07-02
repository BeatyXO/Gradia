"use client";

import { useEffect, useState } from "react";
import { Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssessments, saveSubmission, subscribeToStoreChanges } from "@/lib/gradia-store";
import { registerSubmissionOnChain } from "@/lib/genlayer";
import { describeError, explorerUrl } from "@/lib/utils";
import type { Assessment, Submission, TransactionState } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function SubmissionForm() {
  const [state, setState] = useState<TransactionState>("idle");
  const [savedId, setSavedId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    function refresh() {
      setAssessments(getAssessments());
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = `SUB-${Date.now().toString().slice(-6)}`;
    const submission: Submission = {
      id,
      assessmentId: String(formData.get("assessmentId") || ""),
      title: String(formData.get("title") || ""),
      url: String(formData.get("url") || ""),
      hash: String(formData.get("hash") || ""),
      student: "connected-wallet",
      submittedAt: new Date().toISOString(),
    };

    try {
      setState("wallet");
      setMessage("Requesting wallet connection...");
      if (!window.ethereum) throw new Error("Injected wallet not found.");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No wallet account selected.");

      setState("pending");
      setMessage("Submitting register_submission to StudioNet...");
      const hash = await registerSubmissionOnChain(account, window.ethereum, submission);

      saveSubmission({ ...submission, student: account, txHash: hash });
      setSavedId(id);
      setTxHash(hash);
      setState("accepted");
      setMessage("Transaction submitted. Check the explorer link below for confirmation.");
    } catch (error) {
      console.error("Register Evidence failed:", error);
      setState("failed");
      setMessage(describeError(error));
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel grid gap-4 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Assessment</span>
          {assessments.length === 0 ? (
            <input className="field" disabled placeholder="No assessments yet — create one first" />
          ) : (
            <select name="assessmentId" className="field" required defaultValue="">
              <option value="" disabled>
                Select an assessment...
              </option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.id} · {assessment.title}
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          <span className="label">Submission title</span>
          <input name="title" className="field" required placeholder="Essay or project title" />
        </label>
      </div>
      <label>
        <span className="label">Public evidence URL</span>
        <input name="url" type="url" className="field" required placeholder="https://..." />
      </label>
      <label>
        <span className="label">Evidence hash</span>
        <input name="hash" className="field" required placeholder="sha256:..." />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#49225B]">
            {savedId ? `Submission draft ${savedId} is ready.` : "Only public references and hashes are stored."}
          </p>
          {message ? <p className="text-sm text-[#49225B]/70">{message}</p> : null}
          {txHash ? (
            <a href={explorerUrl(txHash)} className="break-all text-sm font-black text-[#6E3482]">
              {txHash}
            </a>
          ) : null}
        </div>
        <Button type="submit" disabled={state === "wallet" || state === "pending" || assessments.length === 0}>
          <Link2 className="h-4 w-4" />
          Register Evidence
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
