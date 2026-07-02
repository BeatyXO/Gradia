"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, ClipboardList } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { getAssessments, getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import type { Assessment, Submission } from "@/lib/types";

export default function EducatorDashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    function refresh() {
      setAssessments(getAssessments());
      setSubmissions(getSubmissions());
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  const openCount = assessments.filter((item) => item.status === "open").length;
  const pendingCount = assessments.filter((item) => item.status === "assessing").length;
  const latestFinalized = assessments.find((item) => item.status === "finalized");

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#6E3482]">Educator Dashboard</p>
          <h1 className="text-3xl font-black text-[#49225B]">Assessment Operations</h1>
        </div>
        <Button asChild>
          <Link href="/assessments/new">New Assessment</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Open assessments" value={String(openCount)} detail="Records accepting public evidence" />
        <MetricCard label="Pending consensus" value={String(pendingCount)} detail="Submitted work awaiting validators" />
        <MetricCard label="Finalized grade" value={latestFinalized ? latestFinalized.status : "—"} detail="Latest canonical result" />
      </div>
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#6E3482]" />
          <h2 className="text-xl font-black text-[#49225B]">Queue</h2>
        </div>
        <div className="grid gap-3">
          {assessments.length === 0 ? (
            <p className="rounded-md bg-white p-4 text-sm text-[#49225B]/70">
              No assessments yet. <Link href="/assessments/new" className="font-black text-[#6E3482]">Create one</Link> to get started.
            </p>
          ) : (
            assessments.map((assessment) => (
              <Link href={`/assessments/${assessment.id}`} key={assessment.id} className="grid gap-2 rounded-md bg-white p-4 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-black">{assessment.title}</p>
                  <p className="text-sm text-[#49225B]/70">{assessment.rubricSummary}</p>
                </div>
                <p className="text-sm font-black text-[#6E3482]">{submissions.filter((item) => item.assessmentId === assessment.id).length} submissions</p>
              </Link>
            ))
          )}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <ClipboardList className="h-5 w-5 text-[#6E3482]" />
          <h2 className="mt-3 text-lg font-black text-[#49225B]">Rubric Accountability</h2>
          <p className="mt-2 text-sm leading-6 text-[#49225B]/75">Every assessment links criteria, weights, expected evidence, and learning outcomes before consensus is requested.</p>
        </div>
        <div className="panel p-5">
          <CheckCircle2 className="h-5 w-5 text-[#6E3482]" />
          <h2 className="mt-3 text-lg font-black text-[#49225B]">Transaction UX</h2>
          <p className="mt-2 text-sm leading-6 text-[#49225B]/75">Draft, wallet, pending, accepted, finalized, and failed states are surfaced in the contract panel.</p>
        </div>
      </section>
    </div>
  );
}
