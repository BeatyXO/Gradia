"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsensusRecords, subscribeToStoreChanges } from "@/lib/gradia-store";
import type { ConsensusRecord } from "@/lib/types";

export default function ConsensusPage() {
  const [records, setRecords] = useState<ConsensusRecord[]>([]);

  useEffect(() => {
    function refresh() {
      setRecords(getConsensusRecords());
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  const consensus = records[0];

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Steps 4-6</p>
        <h1 className="text-3xl font-black text-[#49225B]">Consensus Viewer</h1>
        <p className="mt-2 text-sm text-[#49225B]/70">
          Consensus results are decoded from the validator vote receipt at the moment they are requested.
          The contract intentionally does not persist a re-queryable copy, since re-running consensus is
          nondeterministic; this is the authoritative on-chain result for that request, cached locally for display.
        </p>
      </div>
      {!consensus ? (
        <section className="panel p-5">
          <p className="text-sm leading-6 text-[#49225B]/75">
            No consensus records yet. Go to the <Link href="/contract" className="font-black text-[#6E3482]">Contract Panel</Link> and request AI assessment for an assessment/submission pair that already exists on-chain.
          </p>
        </section>
      ) : (
        <>
          <section className="panel p-5">
            <p className="text-sm font-semibold text-[#49225B]/70">{consensus.assessmentId} · {consensus.submissionId}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-[0.6fr_1fr]">
              <div className="rounded-md bg-[#49225B] p-5 text-white">
                <p className="text-sm font-black uppercase text-[#A56ABD]">Final Grade</p>
                <p className="mt-3 text-6xl font-black">{consensus.finalGrade}</p>
                <p className="mt-2 text-[#E7DBEF]">{consensus.confidence}% confidence</p>
              </div>
              <div className="grid gap-3">
                <p className="rounded-md bg-white p-3"><strong>Evidence Verified:</strong> {consensus.evidenceVerified ? "Yes" : "No"}</p>
                <p className="rounded-md bg-white p-3"><strong>Hash Matched:</strong> {consensus.evidenceHashMatched ? "Yes" : "Not confirmed"}</p>
                <p className="rounded-md bg-white p-3"><strong>Rubric Alignment:</strong> {consensus.rubricAlignment}</p>
                <p className="rounded-md bg-white p-3"><strong>Learning Outcome Achievement:</strong> {consensus.learningOutcomeAchievement}</p>
                <p className="rounded-md bg-white p-3"><strong>Evidence Quality:</strong> {consensus.evidenceQuality}</p>
              </div>
            </div>
          </section>
          {consensus.verificationNotes ? (
            <section className="panel p-5">
              <h2 className="text-xl font-black text-[#49225B]">Evidence Verification</h2>
              <p className="mt-3 break-all text-sm font-semibold text-[#49225B]/75">{consensus.evidenceUrl}</p>
              <p className="mt-3 text-sm leading-6 text-[#49225B]/75">{consensus.verificationNotes}</p>
            </section>
          ) : null}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <h2 className="text-xl font-black text-[#49225B]">Strength Areas</h2>
              <ul className="mt-3 grid gap-2">
                {consensus.strengths.map((item) => <li className="rounded-md bg-white p-3 text-sm" key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="panel p-5">
              <h2 className="text-xl font-black text-[#49225B]">Improvement Areas</h2>
              <ul className="mt-3 grid gap-2">
                {consensus.improvements.map((item) => <li className="rounded-md bg-white p-3 text-sm" key={item}>{item}</li>)}
              </ul>
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="text-xl font-black text-[#49225B]">Consensus History</h2>
            <ol className="mt-3 grid gap-2">
              {consensus.history.map((item) => <li className="rounded-md bg-white p-3 text-sm" key={item}>{item}</li>)}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
