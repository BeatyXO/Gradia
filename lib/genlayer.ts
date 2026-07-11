"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { Hash } from "genlayer-js/types";
import type { Assessment, ConsensusRecord, Submission } from "@/lib/types";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function contractAddress() {
  const address = process.env.NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS is not configured.");
  }
  return address as `0x${string}`;
}

export function createGradiaReadClient() {
  return createClient({ chain: studionet });
}

export function createGradiaWriteClient(address: string, provider: EthereumProvider) {
  return createClient({
    chain: studionet,
    account: address as `0x${string}`,
    provider,
  });
}

export async function connectStudioNet(address: string, provider: EthereumProvider) {
  const client = createGradiaWriteClient(address, provider);
  try {
    await client.connect("studionet");
  } catch (error) {
    // client.connect() also tries to install a MetaMask Snap, which fails on
    // wallets without Snaps support (e.g. "method [wallet_getSnaps] doesn't
    // has corresponding handler"). The network switch it performs first still
    // applies, and writeContract/readContract don't need the Snap, so this
    // failure is safe to ignore rather than blocking the transaction.
    console.warn("client.connect() did not fully complete (continuing anyway):", error);
  }
  return client;
}

export async function createAssessmentOnChain(address: string, provider: EthereumProvider, assessment: Assessment) {
  const client = await connectStudioNet(address, provider);
  const txHash = await client.writeContract({
    address: contractAddress(),
    functionName: "create_assessment",
    args: [
      assessment.id,
      assessment.title,
      assessment.subject,
      assessment.instructions,
      assessment.objectives,
      assessment.requirements,
      assessment.maxScore,
      assessment.dueDate,
      assessment.rubricSummary,
    ],
    value: BigInt(0),
  });
  return String(txHash);
}

export async function registerSubmissionOnChain(address: string, provider: EthereumProvider, submission: Submission) {
  const client = await connectStudioNet(address, provider);
  const txHash = await client.writeContract({
    address: contractAddress(),
    functionName: "register_submission",
    args: [submission.id, submission.assessmentId, submission.title, submission.url, submission.hash, submission.submittedAt],
    value: BigInt(0),
  });
  return String(txHash);
}

export async function requestConsensusOnChain(address: string, provider: EthereumProvider, assessmentId: string, submissionId: string) {
  const client = await connectStudioNet(address, provider);
  const txHash = await client.writeContract({
    address: contractAddress(),
    functionName: "request_assessment_consensus",
    args: [assessmentId, submissionId],
    value: BigInt(0),
    consensusMaxRotations: 5,
  });
  return String(txHash);
}

export async function readAssessmentOnChain(assessmentId: string) {
  const client = createGradiaReadClient();
  const raw = (await client.readContract({
    address: contractAddress(),
    functionName: "get_assessment",
    args: [assessmentId],
  })) as string;
  if (!raw) return null;
  return JSON.parse(raw) as Assessment;
}

export async function readConsensusRecord(assessmentId: string, submissionId: string) {
  const client = createGradiaReadClient();
  const raw = (await client.readContract({
    address: contractAddress(),
    functionName: "get_consensus_record",
    args: [assessmentId, submissionId],
  })) as string;
  if (!raw) return null;
  return JSON.parse(raw) as ConsensusRecord;
}

type ConsensusReceipt = {
  consensus_data?: {
    validators?: Array<{
      vote?: string;
      result?: string;
    }>;
  };
};

function decodeBase64(value: string) {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return Uint8Array.from(window.atob(value), (char) => char.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(value, "base64"));
}

function tryDecodeConsensusResult(value: string) {
  try {
    const raw = decodeBase64(value);
    if (raw[0] !== 0) return null;
    const text = new TextDecoder("utf-8").decode(raw.slice(1));
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Omit<ConsensusRecord, "assessmentId" | "submissionId">;
  } catch {
    return null;
  }
}

export function consensusRecordFromReceipt(receipt: unknown, assessmentId: string, submissionId: string) {
  const validators = (receipt as ConsensusReceipt).consensus_data?.validators ?? [];
  for (const validator of validators) {
    if (validator.vote !== "agree" || !validator.result) continue;
    const record = tryDecodeConsensusResult(validator.result);
    if (record) return { ...record, assessmentId, submissionId } satisfies ConsensusRecord;
  }
  return null;
}

export async function waitForAccepted(txHash: string) {
  const client = createGradiaReadClient();
  return client.waitForTransactionReceipt({
    hash: txHash as Hash,
    status: TransactionStatus.ACCEPTED,
    fullTransaction: true,
  } as Parameters<typeof client.waitForTransactionReceipt>[0] & { fullTransaction: boolean });
}
