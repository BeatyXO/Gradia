export function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs font-black uppercase text-[#6E3482]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#49225B]">{value}</p>
      <p className="mt-2 text-sm text-[#49225B]/75">{detail}</p>
    </div>
  );
}
