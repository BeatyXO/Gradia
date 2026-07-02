import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionState } from "@/lib/types";

const labels: Record<TransactionState, string> = {
  idle: "Ready",
  wallet: "Wallet",
  pending: "Pending",
  accepted: "Accepted",
  finalized: "Finalized",
  failed: "Failed",
};

export function StatusPill({ state }: { state: TransactionState }) {
  const Icon = state === "failed" ? XCircle : state === "finalized" ? CheckCircle2 : state === "pending" ? Loader2 : Clock3;
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-bold uppercase tracking-normal",
        state === "failed" && "border-red-200 bg-red-50 text-red-800",
        state === "finalized" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        state !== "failed" && state !== "finalized" && "border-[#A56ABD] bg-[#E7DBEF] text-[#49225B]",
      )}
    >
      <Icon className={cn("h-4 w-4", state === "pending" && "animate-spin")} />
      {labels[state]}
    </span>
  );
}
