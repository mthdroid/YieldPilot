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

Yes
YieldPilot is an autonomous AI DeFi agent that registers its on-chain identity, scans wallets, analyzes portfolios through 8 specialized modules, synthesizes recommendations via Claude AI, and publishes verifiable strategy NFTs — building on-chain reputation with every interaction.

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

YieldPilot is an **autonomous AI DeFi agent** that:

1. **Connects** to any BSC wallet via MetaMask
2. **Scans** all tokens, DeFi positions, and protocol interactions via BSCScan API
3. **Analyzes** the portfolio through **8 specialized modules** (health scoring, yield optimization, impermanent loss tracking, liquidation monitoring, protocol risk assessment, concentration risk, gas optimization, market sentiment)
4. **Synthesizes** all module outputs using **Claude AI** into personalized, actionable recommendations
5. **Publishes** the optimized strategy **on-chain as an ERC-721 NFT** on BSC and opBNB, with a verifiable strategy hash
6. **Exports** a complete PDF report for offline reference

The agent registers its on-chain identity (inspired by BNB Chain NFA standards) with its 8 analysis modules, builds verifiable reputation through published strategies, and operates autonomously — all analysis modules work independently, with Claude AI as the synthesis layer.

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

### AI Agent On-Chain Identity (NFA-Inspired)

YieldPilot implements an AI agent identity system inspired by BNB Chain NFA (Non-Fungible Agent) standards:

- **`registerAgent(name, version, modules)`** — Register the AI agent on-chain with its 8 analysis modules
- **`getAgentProfile(address)`** — Query agent name, version, module list, total strategies, avg risk score
- **`isRegisteredAgent(address)`** — Verify an address is a registered AI agent
- **Agent Reputation** — Automatically tracks total strategies published and weighted average risk score
- The agent builds verifiable, on-chain reputation with every strategy it publishes

### Key Differentiators

- **AI Agent with On-Chain Identity** — The agent registers and builds reputation on-chain (NFA-inspired)
- **8 independent modules** — not a single score, but a complete risk/opportunity breakdown
- **Autonomous analysis** — every module works standalone, Claude AI synthesizes results
- **On-chain verifiable** — strategy hash ensures integrity, stored as ERC-721 NFT
- **Agent Reputation System** — avg risk score, total strategies tracked on-chain per agent
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

# YieldPilot — Autonomous AI DeFi Agent for BNB Chain

> An AI agent that registers its on-chain identity, scans your BSC wallet, analyzes your portfolio through 8 specialized modules, synthesizes recommendations via Claude AI, and publishes verifiable strategy NFTs — building on-chain reputation with every interaction. Inspired by BNB Chain NFA standards.

---

## The Problem

DeFi users on BNB Chain interact with 5–10 protocols (Venus, PancakeSwap, Alpaca, Beefy, Stargate, Thena) but have **no unified view** of their risk exposure, yield opportunities, or portfolio health. Existing tools either:

- Show only token balances — no risk analysis
- Require premium subscriptions for basic insights
- Don't cover BNB Chain protocols specifically
- Provide generic advice not tailored to the user's actual positions

**The result**: users unknowingly hold concentrated positions, miss higher-yield opportunities, face liquidation risks, and make suboptimal DeFi decisions.

---

## The Solution

YieldPilot is an **autonomous AI DeFi agent** with on-chain identity (inspired by BNB Chain NFA standards). The agent registers itself on-chain, scans your full DeFi portfolio, runs **8 independent analysis modules** (each producing its own risk/opportunity score), synthesizes results with **Claude AI** into personalized recommendations, publishes your **optimized strategy on-chain as an ERC-721 NFT** — and automatically builds verifiable reputation with every strategy published.

---

## How It Works

```
Wallet → BSCScan Scan → 8 Analysis Modules → Claude AI Synthesis → On-Chain NFT + PDF
```

**Step 1 — Connect**: User connects via MetaMask. YieldPilot auto-detects and switches to BSC.

**Step 2 — Scan**: BSCScan API fetches native BNB, all BEP-20 tokens, DeFi positions, and protocol interactions.

**Step 3 — Analyze**: 8 independent modules score the portfolio:

| # | Module | Method | Output |
|---|--------|--------|--------|
| 1 | **Portfolio Health** | Herfindahl-Hirschman Index, stablecoin ratio, protocol quality | Health score 0–100 |
| 2 | **Yield Optimizer** | Cross-protocol APY comparison (Venus, PancakeSwap, Alpaca, Beefy) | Best yield per token |
| 3 | **IL Tracker** | LP position detection, impermanent loss estimation | IL risk alerts |
| 4 | **Liquidation Guard** | Health factor calculation for Venus/Alpaca lending | Liquidation warnings |
| 5 | **Protocol Risk** | TVL, audit status, incident history per protocol | Protocol risk scores |
| 6 | **Concentration Risk** | Single-token (>40%) and single-protocol exposure detection | Concentration alerts |
| 7 | **Gas Optimizer** | Rebalancing cost estimation, optimal timing | Gas cost estimates |
| 8 | **Market Sentiment** | BNB price trend, ecosystem health indicators | Bullish/Neutral/Bearish |

**Step 4 — AI Synthesis**: Claude AI receives all 8 module outputs and produces natural-language strategy advice with top 5 actionable recommendations.

**Step 5 — Publish On-Chain**: Strategy minted as ERC-721 NFT on BSC Mainnet or opBNB. Strategy data is hashed (keccak256) for integrity verification.

**Step 6 — Export**: Full analysis downloadable as PDF report (jsPDF + html2canvas).

---

## Key Differentiators

- **AI Agent with On-Chain Identity** — Registers on-chain, builds verifiable reputation (NFA-inspired)
- **8 independent modules** — not a single score, but a complete risk/opportunity breakdown
- **Autonomous operation** — every module works standalone, Claude AI synthesizes results
- **On-chain verifiable** — keccak256 strategy hash stored as ERC-721 NFT
- **Agent Reputation** — avg risk score, total strategies tracked on-chain per agent
- **Multi-chain** — BSC Mainnet + opBNB, with in-app network switching
- **Strategy Explorer** — browse and search community-published strategies with hash verification
- **Demo mode** — full analysis flow without connecting a wallet
- **BSC-native** — 6 protocols mapped to the BNB Chain ecosystem (Venus, PancakeSwap, Alpaca, Beefy, Stargate, Thena)

---

## Live Contracts (Verified)

| Network | Address | Status |
|---------|---------|--------|
| **BSC Mainnet** | [`0xF5726c5D8C47A9B278e610917E9c7191bc3e135E`](https://bscscan.com/address/0xF5726c5D8C47A9B278e610917E9c7191bc3e135E#code) | Verified |
| **opBNB** | [`0xFED653FBE3371E11243A4772589A2cA3Aea859F0`](https://opbnbscan.com/address/0xFED653FBE3371E11243A4772589A2cA3Aea859F0#code) | Verified |

## On-Chain Proof Transactions

| Network | Transaction |
|---------|------------|
| **BSC Mainnet** | [`0x6b8e8f70...d91d`](https://bscscan.com/tx/0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d) |
| **opBNB** | [`0x85001d9e...16c5`](https://opbnbscan.com/tx/0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5) |

---

## Example Analysis

A BSC portfolio with BNB, USDT, CAKE, and XVS across 3 protocols produces:

- **Risk Score**: 35/100 (moderate)
- **Expected APY**: 12.5% (optimized from 5.8%)
- **Health Factor**: 2.4 (safe zone on Venus)
- **Top Recommendation**: "Rebalance 8% from BNB to USDC to bring concentration below 30%"
- **Warning**: "BNB concentration at 38% approaching 40% threshold"

Strategy hash published as NFT — anyone can verify the analysis integrity on-chain.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5 (ERC-721), Hardhat |
| Frontend | Next.js 14 (App Router), Tailwind CSS, ethers.js v6, Recharts |
| AI | Claude API (Anthropic) — optional, graceful fallback |
| On-Chain | ERC-721 NFT minting, BSC Mainnet + opBNB |
| PDF Export | jsPDF + html2canvas |
| CI/CD | GitHub Actions (smart contract tests + build verification) |
| Testing | Hardhat + Chai — 17 unit tests, all passing |

---

## Smart Contract Tests

```
  StrategyRegistry — 17 passing (2s)
    ✔ should set correct name and symbol
    ✔ should mint NFT and store strategy data
    ✔ should emit StrategyPublished event
    ✔ should revert if riskScore > 100
    ✔ should revert if strategyHash is zero
    ✔ should allow token owner to update URI
    ✔ should allow transfer of strategy NFTs
    ... and 10 more
```

---

## Tracks

- **DeFi** — Autonomous AI agent for portfolio intelligence, yield optimization, and risk analysis
- **AI** — On-chain AI agent identity + Claude-powered strategy synthesis from 8 module outputs
- **opBNB** — Multi-chain deployment (BSC Mainnet + opBNB)

## AI Build Log

Full documentation of how Claude AI was used throughout development: [AI_BUILD_LOG.md](./AI_BUILD_LOG.md)
