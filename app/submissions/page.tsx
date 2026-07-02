"use client";

import { useEffect, useState } from "react";
import { SubmissionForm } from "@/components/submission-form";
import { getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import type { Submission } from "@/lib/types";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    function refresh() {
      setSubmissions(getSubmissions());
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Step 3</p>
        <h1 className="text-3xl font-black text-[#49225B]">Submission Registry</h1>
      </div>
      <SubmissionForm />
      <div className="grid gap-3">
        {submissions.length === 0 ? (
          <p className="panel p-4 text-sm text-[#49225B]/70">No submissions registered yet.</p>
        ) : (
          submissions.map((submission) => (
            <article key={submission.id} className="panel p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-black text-[#49225B]">{submission.title}</p>
                  <p className="mt-1 text-sm text-[#49225B]/70">{submission.id} · {submission.assessmentId}</p>
                </div>
                <a href={submission.url} className="text-sm font-black text-[#6E3482]">Open evidence</a>
              </div>
              <p className="mt-3 break-all rounded-md bg-white p-3 text-xs font-semibold text-[#49225B]/80">{submission.hash}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
