"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssessment, getConsensusRecords, getSubmissions, subscribeToStoreChanges } from "@/lib/gradia-store";
import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

export default function PublicAssessmentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [assessment, setAssessment] = useState<Assessment | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [consensus, setConsensus] = useState<ConsensusRecord | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function refresh() {
      setAssessment(getAssessment(id));
      setSubmissions(getSubmissions().filter((item) => item.assessmentId === id));
      setConsensus(getConsensusRecords().find((item) => item.assessmentId === id));
      setLoaded(true);
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, [id]);

  if (loaded && !assessment) {
    return (
      <div className="panel p-5">
        <p className="text-sm text-[#49225B]/75">No local record found for <strong>{id}</strong>.</p>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="grid gap-5">
      <section className="rounded-md bg-[#49225B] p-6 text-white">
        <p className="text-sm font-black uppercase text-[#A56ABD]">Public Assessment Record</p>
        <h1 className="mt-2 text-4xl font-black">{assessment.title}</h1>
        <p className="mt-3 max-w-3xl text-[#E7DBEF]">{assessment.instructions}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4"><p className="text-sm font-black">Final Grade</p><p className="mt-2 text-4xl font-black">{consensus?.finalGrade || "—"}</p></div>
        <div className="panel p-4"><p className="text-sm font-black">Confidence</p><p className="mt-2 text-4xl font-black">{consensus ? `${consensus.confidence}%` : "—"}</p></div>
        <div className="panel p-4"><p className="text-sm font-black">Evidence</p><p className="mt-2 text-4xl font-black">{submissions.length}</p></div>
      </section>
      <section className="panel p-5">
        <h2 className="text-xl font-black text-[#49225B]">Canonical Feedback</h2>
        {consensus ? (
          <>
            <p className="mt-3 text-sm leading-6 text-[#49225B]/75">{consensus.feedback}</p>
            <p className="mt-3 text-sm leading-6 text-[#49225B]/75"><strong>Recommended next steps:</strong> {consensus.nextSteps}</p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#49225B]/75">No consensus has been requested for this assessment yet.</p>
        )}
      </section>
    </div>
  );
}
