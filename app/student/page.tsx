"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssessments, getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import type { Assessment, Submission } from "@/lib/types";

export default function StudentDashboardPage() {
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

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#6E3482]">Student Dashboard</p>
          <h1 className="text-3xl font-black text-[#49225B]">Evidence and Feedback</h1>
        </div>
        <Button asChild>
          <Link href="/submissions">Register Submission</Link>
        </Button>
      </div>
      <section className="grid gap-4">
        {submissions.length === 0 ? (
          <p className="panel p-5 text-sm text-[#49225B]/70">
            No submissions yet. <Link href="/submissions" className="font-black text-[#6E3482]">Register one</Link> to get started.
          </p>
        ) : (
          submissions.map((submission) => {
            const assessment = assessments.find((item) => item.id === submission.assessmentId);
            return (
              <article key={submission.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#49225B]">{submission.title}</p>
                    <p className="mt-1 text-sm text-[#49225B]/70">{assessment?.title || submission.assessmentId}</p>
                  </div>
                  <a href={submission.url} className="inline-flex items-center gap-2 text-sm font-black text-[#6E3482]">
                    Evidence
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <p className="rounded-md bg-white p-3 text-sm"><strong>Status:</strong> {assessment?.status || "open"}</p>
                  <p className="rounded-md bg-white p-3 text-sm"><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                  <p className="rounded-md bg-white p-3 text-sm"><strong>Wallet:</strong> {submission.student}</p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
