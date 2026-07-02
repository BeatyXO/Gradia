# Gradia Protocol

Decentralized Adaptive Grading and Feedback Consensus. Educators register rubric-based
assessments, students submit public evidence (a URL + content hash), and a GenLayer
Intelligent Contract runs an AI-validator consensus to produce an authoritative,
defensible grade — final grade, confidence, rubric alignment, strengths, improvements,
and feedback — recorded on-chain.

Built with Next.js, TypeScript, Tailwind CSS, injected wallet signing, and `genlayer-js`.

## What's on-chain vs. off-chain

- **On-chain**: assessment records, submission references (public URL + hash), and the
  finalized consensus grade.
- **Off-chain**: full submission content itself. Only the public reference and its hash
  are stored on-chain — the contract never sees or stores private files.

## Features

- **Assessment Registry** (`/assessments/new`) — define an assessment's instructions,
  learning objectives, rubric summary, and max score, then either save it as a local
  draft or submit it to the GenLayer contract (`create_assessment`).
- **Rubrics** (`/rubrics`) — the grading framework criteria and weights.
- **Submission Registry** (`/submissions`) — register a public evidence URL + hash
  against an existing assessment (`register_submission`).
- **Contract Panel** (`/contract`) — request AI grading consensus
  (`request_assessment_consensus`) for an assessment/submission pair and wait for the
  transaction receipt; the resulting grade is fetched and displayed automatically.
- **Consensus Viewer** (`/consensus`) — the latest finalized grade, confidence,
  strengths, improvements, and consensus history.
- **Educator / Student dashboards** — role-specific views over the same records.
- **Public / assessment detail pages** (`/public/[id]`, `/assessments/[id]`) — shareable
  read-only views of an assessment and its grade.

All records are also cached in `localStorage` so the UI has something to show
immediately after a transaction, independent of re-querying the chain.

## Stack

- Next.js App Router (Turbopack)
- TypeScript
- Tailwind CSS
- shadcn-style local UI primitives
- GenLayer StudioNet + `genlayer-js`
- Python Intelligent Contract (`contracts/gradia_assessment.py`)

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Fill in `.env.local`:

```
NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS=   # address of your deployed contract
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_EXPLORER_BASE_URL=https://studio.genlayer.com
```

### Deploying the contract

Deploy `contracts/gradia_assessment.py` to GenLayer StudioNet (via GenLayer Studio or
the GenLayer CLI/SDK), then set `NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS` to the resulting
address and restart the dev server.

### Wallet requirements

Any injected EVM wallet (e.g. MetaMask) works for signing transactions. The wallet
must be switched to GenLayer StudioNet. MetaMask Snaps support is not required — the
app degrades gracefully if the wallet doesn't support the Snaps API.

## Testing the full flow

1. Go to **Assessment** → fill the form → **Prepare Transaction** (signs and submits
   `create_assessment`; note the generated assessment ID).
2. Go to **Submissions** → pick that assessment from the dropdown → fill in a real,
   publicly reachable evidence URL and a hash → **Register Evidence**
   (`register_submission`).
3. Go to **Contract** → pick the assessment and submission from the dropdowns →
   **Request AI Assessment** (`request_assessment_consensus`) → **Wait for Accepted
   Receipt**.
4. The finalized grade appears on **Consensus**, the assessment detail page, and the
   homepage.

Grading quality depends on the submission's evidence URL actually being reachable and
containing real, substantive content — the contract is designed to refuse a fabricated
grade when the evidence can't be verified.

## Verification

```bash
npm run typecheck
npm run build
npm ls genlayer-js --depth=0
```

The GenLayer dependency is intentionally pinned to exactly `1.1.8`.
