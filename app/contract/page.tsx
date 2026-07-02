import { ContractPanel } from "@/components/contract-panel";

export default function ContractPage() {
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">GenLayer</p>
        <h1 className="text-3xl font-black text-[#49225B]">Contract Operations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#49225B]/75">
          Live transactions use injected wallet signing, StudioNet network switching, and the pinned GenLayer JavaScript SDK.
        </p>
      </div>
      <ContractPanel />
    </div>
  );
}
