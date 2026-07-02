"use client";

import { useRef, useState } from "react";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAssessment } from "@/lib/gradia-store";
import { createAssessmentOnChain } from "@/lib/genlayer";
import { describeError, explorerUrl } from "@/lib/utils";
import type { Assessment, TransactionState } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

function readAssessment(formEl: HTMLFormElement): Assessment {
  const formData = new FormData(formEl);
  const id = `ASM-${Date.now().toString().slice(-8)}`;
  return {
    id,
    title: String(formData.get("title") || ""),
    subject: String(formData.get("subject") || ""),
    instructions: String(formData.get("instructions") || ""),
    objectives: String(formData.get("objectives") || ""),
    requirements: String(formData.get("requirements") || ""),
    maxScore: Number(formData.get("maxScore") || 100),
    dueDate: String(formData.get("dueDate") || ""),
    rubricSummary: String(formData.get("rubricSummary") || ""),
    owner: "connected-wallet",
    status: "open",
  };
}

export function AssessmentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<TransactionState>("idle");
  const [savedId, setSavedId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");

  function onSaveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const assessment = readAssessment(event.currentTarget);
    saveAssessment(assessment);
    setSavedId(assessment.id);
    setTxHash("");
    setState("accepted");
    setMessage("");
  }

  async function onPrepareTransaction() {
    if (!formRef.current || !formRef.current.reportValidity()) return;
    const assessment = readAssessment(formRef.current);

    try {
      setState("wallet");
      setMessage("Requesting wallet connection...");
      if (!window.ethereum) throw new Error("Injected wallet not found.");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No wallet account selected.");

      setState("pending");
      setMessage("Submitting create_assessment to StudioNet...");
      const hash = await createAssessmentOnChain(account, window.ethereum, assessment);

      saveAssessment({ ...assessment, owner: account, txHash: hash });
      setSavedId(assessment.id);
      setTxHash(hash);
      setState("accepted");
      setMessage("Transaction submitted. Check the explorer link below for confirmation.");
    } catch (error) {
      console.error("Prepare Transaction failed:", error);
      setState("failed");
      setMessage(describeError(error));
    }
  }

  return (
    <form ref={formRef} onSubmit={onSaveDraft} className="panel grid gap-4 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Assessment title</span>
          <input name="title" className="field" required placeholder="Research paper evaluation" />
        </label>
        <label>
          <span className="label">Subject</span>
          <input name="subject" className="field" required placeholder="AI and Education" />
        </label>
      </div>
      <label>
        <span className="label">Assignment instructions</span>
        <textarea name="instructions" className="field min-h-28" required placeholder="What must learners produce?" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Learning objectives</span>
          <textarea name="objectives" className="field min-h-24" required />
        </label>
        <label>
          <span className="label">Submission requirements</span>
          <textarea name="requirements" className="field min-h-24" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="label">Maximum score</span>
          <input name="maxScore" type="number" min="1" className="field" defaultValue={100} required />
        </label>
        <label>
          <span className="label">Due date</span>
          <input name="dueDate" type="date" className="field" required />
        </label>
        <label>
          <span className="label">Rubric summary</span>
          <input name="rubricSummary" className="field" required placeholder="Criteria and weights" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#49225B]">
            {savedId ? `Created local record ${savedId}` : "Records are stored as local drafts until contract submission."}
          </p>
          {message ? <p className="text-sm text-[#49225B]/70">{message}</p> : null}
          {txHash ? (
            <a href={explorerUrl(txHash)} className="break-all text-sm font-black text-[#6E3482]">
              {txHash}
            </a>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button type="button" onClick={onPrepareTransaction} disabled={state === "wallet" || state === "pending"}>
            <Send className="h-4 w-4" />
            Prepare Transaction
          </Button>
        </div>
      </div>
      <input type="hidden" name="state" value={state} readOnly />
    </form>
  );
}
