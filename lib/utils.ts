import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function explorerUrl(txHash?: string) {
  const base = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL || "https://studio.genlayer.com";
  return txHash ? `${base.replace(/\/$/, "")}/transactions/${txHash}` : base;
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const candidate = record.shortMessage || record.message || record.reason || record.error;
    if (typeof candidate === "string") return candidate;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return "Transaction failed.";
}
