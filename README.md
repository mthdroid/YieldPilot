# YieldPilot — Autonomous AI DeFi Agent for BNB Chain

[![CI](https://github.com/mthdroid/YieldPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/mthdroid/YieldPilot/actions/workflows/ci.yml)

> **BNB Chain Hackathon — Good Vibes Only: OpenClaw Edition**

YieldPilot is an autonomous AI DeFi agent that registers its on-chain identity, scans your BSC wallet, analyzes your portfolio through **8 specialized modules**, synthesizes recommendations via **Claude AI**, and publishes verifiable strategy NFTs (ERC-721) on BNB Chain — building on-chain reputation with every interaction. Inspired by BNB Chain NFA (Non-Fungible Agent) standards.

---

## Live Contracts (Verified)

| Network | Address | Explorer |
|---------|---------|----------|
| **BSC Mainnet** | `0xF5726c5D8C47A9B278e610917E9c7191bc3e135E` | [BSCScan](https://bscscan.com/address/0xF5726c5D8C47A9B278e610917E9c7191bc3e135E#code) |
| **opBNB** | `0xFED653FBE3371E11243A4772589A2cA3Aea859F0` | [opBNBScan](https://opbnbscan.com/address/0xFED653FBE3371E11243A4772589A2cA3Aea859F0#code) |

Both contracts are **verified** with full source code on their respective explorers.

## On-Chain Proof Transactions

| Network | TX Hash | Explorer |
|---------|---------|----------|
| BSC Mainnet | `0x6b8e...d91d` | [View on BSCScan](https://bscscan.com/tx/0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d) |
| opBNB | `0x8500...16c5` | [View on opBNBScan](https://opbnbscan.com/tx/0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5) |

---

## How It Works

```
Register Agent → Wallet → BSCScan Scan → 8 Analysis Modules → AI Synthesis → On-Chain NFT + PDF
```

1. **Register Agent** — The AI agent registers on-chain with its name, version, and 8 analysis modules (NFA-inspired identity)
2. **Connect** — User connects their BSC wallet via MetaMask
3. **Scan** — BSCScan API fetches all BNB, BEP-20 tokens, DeFi positions, and protocol interactions
4. **Analyze** — 8 independent modules score the portfolio across risk, yield, and health dimensions
5. **Synthesize** — Claude AI transforms all module outputs into personalized strategy advice
6. **Publish** — Strategy minted as an ERC-721 NFT on BSC or opBNB with keccak256 hash verification
7. **Reputation** — Agent's on-chain profile is automatically updated (total strategies, weighted average risk score)
8. **Export** — Full analysis downloadable as PDF report

---

## 8 Analysis Modules

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

All modules work **independently without an AI key**. Claude AI is an optional enhancement layer.

---

## Example Analysis Output

Below is a real analysis output for a BSC portfolio containing BNB, USDT, CAKE, and Venus (XVS) positions across 3 protocols:

```json
{
  "summary": {
    "totalValueUSD": 15420,
    "riskScore": 35,
    "expectedAPY": 1250,
    "protocolCount": 3,
    "tokenCount": 5,
    "strategyHash": "0x7a3f...b291"
  },
  "modules": [
    {
      "name": "Portfolio Health",
      "score": 72,
      "risk": "medium",
      "findings": [
        "Moderately diversified portfolio (HHI: 0.28)",
        "Using 3 protocols — good distribution",
        "Stablecoin allocation at 32% — within optimal range"
      ]
    },
    {
      "name": "Yield Optimizer",
      "score": 68,
      "risk": "medium",
      "findings": [
        "USDT: Best yield on Venus lending at 4.2% APY",
        "BNB: Stake on PancakeSwap for 8.5% APY",
        "Current portfolio APY: 5.8% → Optimized: 12.5%"
      ]
    },
    {
      "name": "Liquidation Guard",
      "score": 85,
      "risk": "low",
      "findings": [
        "Venus lending health factor: 2.4 (safe >1.5)",
        "No immediate liquidation risk detected"
      ]
    },
    {
      "name": "Concentration Risk",
      "score": 58,
      "risk": "medium",
      "findings": [
        "BNB represents 38% of portfolio — approaching threshold",
        "Protocol distribution: Venus 45%, PancakeSwap 35%, Beefy 20%"
      ]
    }
  ],
  "aiAnalysis": {
    "overallAssessment": "Your portfolio demonstrates solid fundamentals with a 32% stablecoin buffer and active yield generation across 3 protocols. The primary risk is BNB concentration at 38% — a 20% price drop would significantly impact portfolio value. Venus lending positions are healthy with a 2.4 health factor.",
    "topRecommendations": [
      "Rebalance 8% from BNB to USDC to bring concentration below 30%",
      "Move idle USDT from wallet to Venus lending for 4.2% APY",
      "Consider Beefy auto-compounding vault for CAKE position",
      "Set liquidation alerts at health factor 1.8 on Venus",
      "Review positions weekly given current bullish sentiment"
    ],
    "warnings": [
      "BNB concentration approaching 40% threshold"
    ]
  }
}
```

The strategy is then hashed (keccak256) and published as an ERC-721 NFT, ensuring anyone can verify the analysis integrity on-chain.

---

## Smart Contract Tests

28 unit tests covering deployment, strategy publishing, access control, AI agent identity, and ERC-721 compliance:

```
  StrategyRegistry
    Deployment
      ✔ should set correct name and symbol
      ✔ should start with zero strategies
      ✔ should support ERC-721 interface
      ✔ should start with zero agents
    publishStrategy
      ✔ should mint NFT and store strategy data
      ✔ should emit StrategyPublished event
      ✔ should store complete strategy data
      ✔ should revert if riskScore > 100
      ✔ should revert if strategyHash is zero
      ✔ should revert if protocolCount is zero
      ✔ should increment totalProtocolsAnalyzed
      ✔ should auto-increment token IDs
    getStrategy
      ✔ should revert for non-existent strategy
    getStrategiesByCreator
      ✔ should return all strategies by a creator
      ✔ should return empty array for unknown creator
    updateStrategyURI
      ✔ should allow token owner to update URI
      ✔ should revert if caller is not token owner
    ERC-721 transfers
      ✔ should allow transfer of strategy NFTs
    AI Agent Identity
      ✔ should register a new AI agent
      ✔ should increment totalAgents on registration
      ✔ should update agent profile without incrementing totalAgents
      ✔ should revert if agent name is empty
      ✔ should revert if agent version is empty
      ✔ should return isRegisteredAgent correctly
      ✔ should return all registered agents
      ✔ should revert getAgentProfile for unregistered agent
      ✔ should auto-update agent reputation after strategy
      ✔ should not update reputation for non-agent creator

  28 passing (2s)
```

---

## Architecture

```
YieldPilot/
├── .github/workflows/       # CI/CD (GitHub Actions)
├── packages/
│   ├── contracts/            # Solidity — ERC-721 StrategyRegistry
│   │   ├── contracts/
│   │   │   └── StrategyRegistry.sol    # Main contract (OZ v5 ERC-721)
│   │   ├── test/
│   │   │   └── StrategyRegistry.test.ts  # 28 unit tests
│   │   ├── scripts/
│   │   │   ├── deploy.ts               # Deploy script
│   │   │   └── publish-test.ts         # On-chain test publisher
│   │   └── hardhat.config.ts           # BSC + opBNB network config
│   └── web/                  # Next.js 14 App Router
│       ├── src/app/
│       │   ├── page.tsx                # Landing page
│       │   ├── dashboard/page.tsx      # Analysis dashboard
│       │   ├── strategies/page.tsx     # On-chain strategy explorer
│       │   └── api/
│       │       ├── analyze/route.ts    # 8 modules + AI synthesis
│       │       └── portfolio/route.ts  # BSCScan portfolio scanner
│       └── src/lib/
│           ├── wallet.ts               # MetaMask connection
│           ├── contract.ts             # Registry ABI + address
│           └── protocols.ts            # BNB Chain protocol configs
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5 (ERC-721), Hardhat |
| Frontend | Next.js 14 (App Router), Tailwind CSS, ethers.js v6 |
| Charts | Recharts (PieChart, BarChart) |
| AI | Claude API (Anthropic) — optional, graceful fallback |
| On-Chain | ERC-721 NFT minting, BSC Mainnet + opBNB |
| PDF Export | jsPDF + html2canvas |
| CI/CD | GitHub Actions (build + test) |
| Testing | Hardhat + Chai (28 unit tests) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- MetaMask browser extension (for frontend)

### Installation

```bash
# Clone the repo
git clone https://github.com/mthdroid/YieldPilot.git
cd YieldPilot

# Install all dependencies (monorepo workspaces)
npm install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env
```

Fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | For deployment | Deployer wallet private key |
| `BSCSCAN_API_KEY` | Yes | BSCScan API key for portfolio scanning |
| `ANTHROPIC_API_KEY` | Optional | Claude API key for AI synthesis |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | Yes | BSC contract address |
| `NEXT_PUBLIC_REGISTRY_ADDRESS_OPBNB` | Yes | opBNB contract address |

### Development

```bash
# Run smart contract tests (28 tests)
npm test

# Start the Next.js dev server
npm run dev:web

# Compile contracts
cd packages/contracts && npx hardhat compile
```

### Deployment

```bash
# Deploy to BSC Mainnet
npm run deploy:mainnet

# Deploy to opBNB
npm run deploy:opbnb

# Verify contracts
cd packages/contracts
npx hardhat verify --network bsc <address>
npx hardhat verify --network opbnb <address>
```

---

## AI Agent On-Chain Identity (NFA-Inspired)

YieldPilot implements an AI agent identity system inspired by BNB Chain NFA (Non-Fungible Agent) standards:

- **`registerAgent(name, version, modules)`** — Register the AI agent on-chain with its 8 analysis modules
- **`getAgentProfile(address)`** — Query agent name, version, module list, total strategies, avg risk score
- **`isRegisteredAgent(address)`** — Verify an address is a registered AI agent
- **`getRegisteredAgents()`** — List all registered agents
- **Agent Reputation** — Automatically tracks total strategies published and weighted average risk score

The agent builds **verifiable, on-chain reputation** with every strategy it publishes.

---

## Key Features

- **AI Agent with On-Chain Identity** — Registers on-chain, builds verifiable reputation (NFA-inspired)
- **Connect & Scan** — MetaMask wallet connection, automatic portfolio detection via BSCScan API
- **8-Module Analysis** — Each module produces independent risk/opportunity scores
- **AI Synthesis** — Claude AI combines all module outputs into actionable strategy
- **On-Chain Publishing** — Mint your strategy as an ERC-721 NFT with keccak256 hash verification
- **Agent Reputation System** — Avg risk score, total strategies tracked on-chain per agent
- **Multi-Chain** — BSC Mainnet + opBNB with in-app network switching
- **PDF Export** — Download full analysis report as PDF
- **Demo Mode** — Try the full analysis flow without connecting a wallet

## Hackathon Tracks

- **DeFi** — Autonomous AI agent for portfolio intelligence, yield optimization, and risk analysis
- **AI** — On-chain AI agent identity + Claude-powered strategy synthesis from 8 module outputs
- **opBNB** — Multi-chain deployment (BSC Mainnet + opBNB)

## AI Build Log

See [AI_BUILD_LOG.md](./AI_BUILD_LOG.md) for a detailed account of how AI was used throughout development.

## License

MIT
