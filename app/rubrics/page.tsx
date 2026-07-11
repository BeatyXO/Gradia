"use client";

import { useEffect, useState } from "react";
import { getAssessments, subscribeToStoreChanges } from "@/lib/gradia-store";
import { readAssessmentOnChain } from "@/lib/genlayer";
import type { Assessment } from "@/lib/types";

export default function RubricsPage() {
  const [assessmentIds, setAssessmentIds] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, Assessment | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function refresh() {
      setAssessmentIds(getAssessments().map((item) => item.id));
    }
    refresh();
    return subscribeToStoreChanges(refresh);
  }, []);

  useEffect(() => {
    assessmentIds.forEach((id) => {
      if (id in records || loading[id]) return;
      setLoading((prev) => ({ ...prev, [id]: true }));
      readAssessmentOnChain(id)
        .then((record) => setRecords((prev) => ({ ...prev, [id]: record })))
        .catch(() => setRecords((prev) => ({ ...prev, [id]: null })))
        .finally(() => setLoading((prev) => ({ ...prev, [id]: false })));
    });
  }, [assessmentIds, records, loading]);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Step 2</p>
        <h1 className="text-3xl font-black text-[#49225B]">Rubric Registry</h1>
        <p className="mt-2 text-sm text-[#49225B]/75">
          Rubric summaries fetched live from each assessment&apos;s on-chain record.
        </p>
      </div>
      <div className="grid gap-4">
        {assessmentIds.length === 0 ? (
          <p className="text-sm text-[#49225B]/70">No assessments yet. Create one to register a rubric on-chain.</p>
        ) : (
          assessmentIds.map((id) => {
            const record = records[id];
            return (
              <article key={id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-[#6E3482]">{id}</p>
                    <h2 className="text-xl font-black text-[#49225B]">{record?.title ?? (loading[id] ? "Loading…" : "Not found on-chain")}</h2>
                  </div>
                  {record ? (
                    <span className="rounded-md bg-[#A56ABD] px-3 py-2 text-sm font-black text-white">max {record.maxScore}</span>
                  ) : null}
                </div>
                {record ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <p className="rounded-md bg-white p-3 text-sm"><strong>Rubric:</strong> {record.rubricSummary}</p>
                    <p className="rounded-md bg-white p-3 text-sm"><strong>Objectives:</strong> {record.objectives}</p>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
