"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssessment as getLocalAssessment, getConsensusRecords, getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import { readAssessmentOnChain } from "@/lib/genlayer";
import { explorerUrl } from "@/lib/utils";
import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

export default function AssessmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [assessment, setAssessment] = useState<Assessment | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [consensus, setConsensus] = useState<ConsensusRecord | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function refresh() {
      setSubmissions(getSubmissions().filter((item) => item.assessmentId === id));
      setConsensus(getConsensusRecords().find((item) => item.assessmentId === id));
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    readAssessmentOnChain(id)
      .then((record) => {
        if (cancelled) return;
        // Fall back to the local copy (e.g. tx still pending/not yet mined) if the chain has nothing yet.
        setAssessment(record ?? getLocalAssessment(id));
      })
      .catch(() => {
        if (!cancelled) setAssessment(getLocalAssessment(id));
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loaded && !assessment) {
    return (
      <div className="panel p-5">
        <p className="text-sm text-[#49225B]/75">No local record found for <strong>{id}</strong>. It may only exist on-chain, or on a different browser/device than the one that created it.</p>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#6E3482]">{assessment.id}</p>
          <h1 className="text-3xl font-black text-[#49225B]">{assessment.title}</h1>
          <p className="mt-2 text-sm text-[#49225B]/75">{assessment.subject} · max {assessment.maxScore} · due {assessment.dueDate}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/public/${assessment.id}`}>Public View</Link>
        </Button>
      </div>
      <section className="panel p-5">
        <h2 className="text-xl font-black text-[#49225B]">Assessment Record</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="rounded-md bg-white p-3 text-sm"><strong>Instructions:</strong> {assessment.instructions}</p>
          <p className="rounded-md bg-white p-3 text-sm"><strong>Objectives:</strong> {assessment.objectives}</p>
          <p className="rounded-md bg-white p-3 text-sm"><strong>Requirements:</strong> {assessment.requirements}</p>
          <p className="rounded-md bg-white p-3 text-sm"><strong>Rubric:</strong> {assessment.rubricSummary}</p>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div className="panel p-5">
          <h2 className="text-xl font-black text-[#49225B]">Submissions</h2>
          <div className="mt-4 grid gap-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-[#49225B]/70">No submissions registered for this assessment yet.</p>
            ) : (
              submissions.map((submission) => (
                <a key={submission.id} href={submission.url} className="rounded-md bg-white p-4">
                  <p className="font-black">{submission.title}</p>
                  <p className="mt-1 break-all text-xs text-[#49225B]/70">{submission.hash}</p>
                </a>
              ))
            )}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-black text-[#49225B]">Consensus</h2>
          {consensus ? (
            <>
              <p className="mt-4 text-5xl font-black text-[#49225B]">{consensus.finalGrade}</p>
              <p className="mt-2 text-sm font-semibold text-[#49225B]/75">{consensus.confidence}% confidence</p>
              <p className="mt-4 text-sm leading-6 text-[#49225B]/75">{consensus.feedback}</p>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#49225B]/70">No consensus requested yet.</p>
          )}
          {assessment.txHash ? (
            <a className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#6E3482]" href={explorerUrl(assessment.txHash)}>
              Explorer record
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
