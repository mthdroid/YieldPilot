# DoraHacks BUIDL Submission — YieldPilot

---

## BUIDL Name

YieldPilot

## BUIDL Logo

Use `buidl-logo.svg` (in project root) — convert to PNG 480x480 before uploading.
On Windows: open it in a browser → screenshot → crop to 480x480.
Or use: https://svgtopng.com/

## Category

DeFi

## Is this BUIDL an AI Agent?

No
(It uses AI for analysis synthesis, but it is a DeFi tool, not an autonomous agent.)

---

## Vision

### Problem

DeFi users on BNB Chain face a fragmented portfolio management experience. They interact with 5–10 protocols (Venus, PancakeSwap, Alpaca, Beefy, Stargate, Thena) but have **no unified view** of their risk exposure, yield opportunities, or portfolio health. Existing tools either:

- Show only token balances (no risk analysis)
- Require premium subscriptions for basic insights
- Don't cover BNB Chain protocols specifically
- Provide generic advice not tailored to the user's actual positions

**The result**: users unknowingly hold concentrated positions, miss higher-yield opportunities, face liquidation risks, and make suboptimal DeFi decisions.

### Solution

YieldPilot is an **AI-powered DeFi portfolio intelligence platform** that:

1. **Connects** to any BSC wallet via MetaMask
2. **Scans** all tokens, DeFi positions, and protocol interactions via BSCScan API
3. **Analyzes** the portfolio through **8 specialized modules** (health scoring, yield optimization, impermanent loss tracking, liquidation monitoring, protocol risk assessment, concentration risk, gas optimization, market sentiment)
4. **Synthesizes** all module outputs using **Claude AI** into personalized, actionable recommendations
5. **Publishes** the optimized strategy **on-chain as an ERC-721 NFT** on BSC and opBNB, with a verifiable strategy hash
6. **Exports** a complete PDF report for offline reference

YieldPilot works **without an AI key** — all 8 analysis modules run independently. Claude AI is an optional enhancement layer that transforms raw data into natural-language strategy advice.

---

## Detailed Project Description

### How It Works

**Step 1 — Connect**
User connects their BSC wallet via MetaMask. YieldPilot auto-detects the chain and switches to BNB Smart Chain if needed.

**Step 2 — Scan**
The `/api/portfolio` route queries BSCScan API to fetch:
- Native BNB balance
- All BEP-20 token holdings and transfers
- Protocol interactions (Venus, PancakeSwap, Alpaca, Beefy, Stargate, Thena)
- Historical transaction patterns

**Step 3 — Analyze**
The `/api/analyze` route runs 8 independent analysis modules:

| # | Module | Method | Output |
|---|--------|--------|--------|
| 1 | **Portfolio Health** | Herfindahl-Hirschman Index (HHI) for diversification, stablecoin ratio, protocol quality scoring | Health score 0–100 |
| 2 | **Yield Optimizer** | Cross-protocol APY comparison across Venus lending, PancakeSwap farms, Alpaca leveraged yield, Beefy vaults | Best yield per token |
| 3 | **IL Tracker** | LP position detection, impermanent loss estimation based on price divergence | IL exposure alerts |
| 4 | **Liquidation Guard** | Health factor calculation for lending positions on Venus and Alpaca | Liquidation warnings |
| 5 | **Protocol Risk** | TVL analysis, audit status, incident track record, smart contract age | Protocol risk scores |
| 6 | **Concentration Risk** | Single-token exposure (>40% = warning), single-protocol exposure detection | Concentration alerts |
| 7 | **Gas Optimizer** | Rebalancing cost estimation based on current gas prices, optimal timing suggestions | Gas cost estimates |
| 8 | **Market Sentiment** | BNB price trend analysis (24h, 7d), ecosystem health indicators | Bullish/Neutral/Bearish |

**Step 4 — AI Synthesis**
Claude AI receives all 8 module outputs as structured JSON and produces:
- Overall risk assessment in natural language
- Top 3–5 actionable recommendations
- Warning flags for critical risks
- Consolidated risk score and expected APY

**Step 5 — Publish On-Chain**
The user can mint their strategy as an **ERC-721 NFT** on BSC Mainnet or opBNB:
- Strategy data is hashed (keccak256) for integrity verification
- NFT stores: creator, wallet analyzed, risk score, expected APY, protocol count, strategy hash, timestamp, chain ID
- Anyone can verify the strategy by comparing the hash

**Step 6 — Export**
Full analysis is exportable as a PDF report via jsPDF + html2canvas.

### Architecture Diagram

See `architecture-diagram.svg` in the project root — upload this image to the BUIDL description.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5 (ERC-721), Hardhat |
| Frontend | Next.js 14 (App Router), Tailwind CSS, ethers.js v6 |
| Charts | Recharts (PieChart, BarChart) |
| AI | Claude API (Anthropic) — optional, graceful fallback |
| On-Chain | ERC-721 NFT minting, BSC Mainnet + opBNB |
| PDF Export | jsPDF + html2canvas |
| Testing | Hardhat + Chai (17 unit tests) |

### Live Contracts (Verified)

| Network | Contract | Status |
|---------|----------|--------|
| BSC Mainnet | `0xF5726c5D8C47A9B278e610917E9c7191bc3e135E` | Verified on BSCScan |
| opBNB | `0xFED653FBE3371E11243A4772589A2cA3Aea859F0` | Verified on opBNBScan |

### On-Chain Proof Transactions

| Network | TX Hash |
|---------|---------|
| BSC | `0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d` |
| opBNB | `0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5` |

### Key Differentiators

- **8 independent modules** — not a single score, but a complete risk/opportunity breakdown
- **AI is optional** — every module works standalone without an API key
- **On-chain verifiable** — strategy hash ensures integrity, stored as ERC-721 NFT
- **Multi-chain** — BSC Mainnet + opBNB, with network switching in the UI
- **Demo mode** — try the full analysis flow without connecting a wallet
- **BSC-native** — protocols specifically mapped to the BNB Chain ecosystem

### AI Build Log

Full documentation of how Claude AI was used throughout development is available at `AI_BUILD_LOG.md` in the repository.

---

## Links

### GitHub
`https://github.com/[YOUR_USERNAME]/YieldPilot`
(Fill in after creating the repo)

### Project Website
`https://yieldpilot.vercel.app`
(Fill in after Vercel deployment)

### Demo Video
`https://youtube.com/watch?v=XXXXX`
(Fill in after recording — recommended 1–3 minutes)

---

## Social Links

Use at least one:
- X/Twitter: your personal or project account
- If you have no project social, use your personal account

---

## Text to Copy-Paste into DoraHacks Description Field

(Below is the full markdown you can paste directly into the BUIDL description)

---

# YieldPilot — AI-Powered DeFi Portfolio Intelligence

> Connect your wallet. Get personalized yield strategies and risk analysis powered by AI on BNB Chain. Publish your optimized strategy on-chain as a verifiable NFT.

## The Problem

DeFi users on BNB Chain interact with 5–10 protocols but have no unified view of their risk, yield, or portfolio health. Existing tools show only balances — no risk analysis, no yield optimization, no personalized strategy.

## The Solution

YieldPilot scans your full DeFi portfolio, runs **8 specialized analysis modules**, synthesizes results with **Claude AI**, and lets you **publish your strategy on-chain as an ERC-721 NFT**.

## How It Works

```
Wallet → Scan (BSCScan) → 8 Modules → AI Synthesis → On-Chain NFT
```

**Connect** your wallet → **Scan** all tokens & positions → **Analyze** through 8 modules → **AI** synthesizes into strategy → **Publish** as NFT on BSC/opBNB → **Export** PDF report

## 8 Analysis Modules

| Module | What It Does |
|--------|-------------|
| Portfolio Health | Diversification scoring (HHI index) |
| Yield Optimizer | Best APYs across Venus, PancakeSwap, Alpaca, Beefy |
| IL Tracker | Impermanent loss estimation on LP positions |
| Liquidation Guard | Health factor monitoring for lending |
| Protocol Risk | TVL, audits, incident history |
| Concentration Risk | Single-token & protocol exposure alerts |
| Gas Optimizer | Rebalancing cost estimation |
| Market Sentiment | BNB ecosystem trend analysis |

All modules work **without an AI key**. Claude AI is an optional enhancement.

## Live Contracts (Verified)

| Network | Address |
|---------|---------|
| BSC Mainnet | [`0xF572...35E`](https://bscscan.com/address/0xF5726c5D8C47A9B278e610917E9c7191bc3e135E#code) |
| opBNB | [`0xFED6...F0`](https://opbnbscan.com/address/0xFED653FBE3371E11243A4772589A2cA3Aea859F0#code) |

## On-Chain Proof

| Network | Transaction |
|---------|------------|
| BSC | [`0x6b8e...d91d`](https://bscscan.com/tx/0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d) |
| opBNB | [`0x8500...16c5`](https://opbnbscan.com/tx/0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5) |

## Tech Stack

- **Contracts**: Solidity 0.8.24 + OpenZeppelin v5 + Hardhat (17 tests)
- **Frontend**: Next.js 14 + Tailwind CSS + ethers.js v6 + Recharts
- **AI**: Claude API (Anthropic) — optional
- **On-Chain**: ERC-721 NFT on BSC & opBNB
- **Export**: PDF via jsPDF + html2canvas

## Hackathon Tracks

- **DeFi** — Portfolio intelligence and yield optimization
- **AI** — Claude-powered strategy synthesis
- **opBNB** — Multi-chain deployment

## AI Build Log

See [AI_BUILD_LOG.md](./AI_BUILD_LOG.md) for details on how AI was used throughout development.
