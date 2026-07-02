"use client";

import { useState } from "react";
import { PlugZap, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function WalletButton() {
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function connect() {
    setError("");
    if (!window.ethereum) {
      setError("Injected wallet not found");
      return;
    }

    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
    setAddress(accounts[0] || "");
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="hidden text-xs font-semibold text-red-100 md:inline">{error}</span> : null}
      <Button onClick={connect} variant={address ? "secondary" : "primary"} size="sm" title="Connect injected wallet">
        {address ? <Wallet className="h-4 w-4" /> : <PlugZap className="h-4 w-4" />}
        {shortAddress(address)}
      </Button>
    </div>
  );
}
