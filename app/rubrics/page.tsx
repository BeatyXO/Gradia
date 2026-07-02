import { sampleRubric } from "@/lib/mock-data";

export default function RubricsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Step 2</p>
        <h1 className="text-3xl font-black text-[#49225B]">Rubric Registry</h1>
      </div>
      <div className="grid gap-4">
        {sampleRubric.map((criterion) => (
          <article key={criterion.title} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#49225B]">{criterion.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#49225B]/75">{criterion.performance}</p>
              </div>
              <span className="rounded-md bg-[#A56ABD] px-3 py-2 text-sm font-black text-white">{criterion.weight}%</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <p className="rounded-md bg-white p-3 text-sm"><strong>Outcome:</strong> {criterion.outcome}</p>
              <p className="rounded-md bg-white p-3 text-sm"><strong>Evidence:</strong> {criterion.evidence}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
