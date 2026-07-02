"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { getAssessments, getConsensusRecords, getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import { explorerUrl } from "@/lib/utils";
import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

export default function HomePage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [consensusRecords, setConsensusRecords] = useState<ConsensusRecord[]>([]);

  useEffect(() => {
    function refresh() {
      setAssessments(getAssessments());
      setSubmissions(getSubmissions());
      setConsensusRecords(getConsensusRecords());
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  const latestConsensus = consensusRecords[0];

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-md bg-[#49225B] text-white">
        <div className="grid gap-6 p-6 md:grid-cols-[1.25fr_0.75fr] md:p-8">
          <div>
            <p className="text-sm font-black uppercase text-[#A56ABD]">Gradia Protocol</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Decentralized Adaptive Grading and Feedback Consensus</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#E7DBEF]">
              A StudioNet-ready assessment console for creating rubric-based evaluations, registering public evidence, and forming defensible AI consensus records on GenLayer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/assessments/new">
                  Create Assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contract">Open Contract Panel</Link>
              </Button>
            </div>
          </div>
          <div className="grid content-end gap-3">
            <div className="rounded-md border border-[#A56ABD]/50 bg-[#2b1238]/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">Consensus Snapshot</p>
                <StatusPill state={latestConsensus ? "finalized" : "idle"} />
              </div>
              {latestConsensus ? (
                <>
                  <p className="mt-5 text-5xl font-black">{latestConsensus.finalGrade}</p>
                  <p className="mt-2 text-sm text-[#E7DBEF]">{latestConsensus.confidence}% confidence across rubric evaluators</p>
                </>
              ) : (
                <p className="mt-5 text-sm text-[#E7DBEF]">No consensus records yet. Request one from the Contract Panel once you have an assessment and submission on-chain.</p>
              )}
            </div>
            {latestConsensus ? (
              <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#E7DBEF]" href="/consensus">
                View consensus record
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Assessments" value={String(assessments.length)} detail="Open and active evaluation records" />
        <MetricCard label="Submissions" value={String(submissions.length)} detail="Public evidence references tracked" />
        <MetricCard label="Confidence" value={latestConsensus ? `${latestConsensus.confidence}%` : "—"} detail="Latest canonical assessment result" />
        <MetricCard label="Network" value="StudioNet" detail="GEN token transaction target" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#6E3482]" />
            <h2 className="text-xl font-black text-[#49225B]">Active Assessment Board</h2>
          </div>
          <div className="grid gap-3">
            {assessments.length === 0 ? (
              <p className="rounded-md bg-white p-4 text-sm text-[#49225B]/70">No assessments yet. <Link href="/assessments/new" className="font-black text-[#6E3482]">Create one</Link> to get started.</p>
            ) : (
              assessments.map((assessment) => (
                <Link key={assessment.id} href={`/assessments/${assessment.id}`} className="rounded-md border border-[#A56ABD]/35 bg-white p-4 transition hover:border-[#6E3482]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[#49225B]">{assessment.title}</p>
                      <p className="mt-1 text-sm text-[#49225B]/70">{assessment.subject} · due {assessment.dueDate}</p>
                    </div>
                    <span className="rounded-md bg-[#A56ABD] px-3 py-1 text-xs font-black uppercase text-white">{assessment.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-black text-[#49225B]">Consensus Output</h2>
          {latestConsensus ? (
            <>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt>Rubric Alignment</dt><dd className="font-black">{latestConsensus.rubricAlignment}</dd></div>
                <div className="flex justify-between gap-4"><dt>Learning Outcome</dt><dd className="font-black">{latestConsensus.learningOutcomeAchievement}</dd></div>
                <div className="flex justify-between gap-4"><dt>Evidence Quality</dt><dd className="font-black">{latestConsensus.evidenceQuality}</dd></div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-[#49225B]/78">{latestConsensus.feedback}</p>
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#49225B]/70">Nothing to show yet. Consensus records appear here after you request one from the Contract Panel.</p>
          )}
        </div>
      </section>
    </div>
  );
}
