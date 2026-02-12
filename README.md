# YieldPilot — AI-Powered DeFi Portfolio Intelligence

[![CI](https://github.com/mthdroid/YieldPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/mthdroid/YieldPilot/actions/workflows/ci.yml)

> **BNB Chain Hackathon — Good Vibes Only: OpenClaw Edition**

YieldPilot connects your wallet, scans your DeFi positions across BSC protocols, runs **8 specialized analysis modules**, synthesizes results with **Claude AI**, and lets you publish your optimized strategy on-chain as a **verifiable ERC-721 NFT**.

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
Wallet → BSCScan Scan → 8 Analysis Modules → AI Synthesis → On-Chain NFT + PDF
```

1. **Connect** — User connects their BSC wallet via MetaMask
2. **Scan** — BSCScan API fetches all BNB, BEP-20 tokens, DeFi positions, and protocol interactions
3. **Analyze** — 8 independent modules score the portfolio across risk, yield, and health dimensions
4. **Synthesize** — Claude AI transforms all module outputs into personalized strategy advice
5. **Publish** — Strategy minted as an ERC-721 NFT on BSC or opBNB with keccak256 hash verification
6. **Export** — Full analysis downloadable as PDF report

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

17 unit tests covering deployment, strategy publishing, access control, and ERC-721 compliance:

```
  StrategyRegistry
    Deployment
      ✔ should set correct name and symbol
      ✔ should start with zero strategies
      ✔ should support ERC-721 interface
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

  17 passing (2s)
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
│   │   │   └── StrategyRegistry.test.ts  # 17 unit tests
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
| Testing | Hardhat + Chai (17 unit tests) |

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
# Run smart contract tests (17 tests)
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

## Key Features

- **Connect & Scan** — MetaMask wallet connection, automatic portfolio detection via BSCScan API
- **8-Module Analysis** — Each module produces independent risk/opportunity scores
- **AI Synthesis** — Claude AI combines all module outputs into actionable strategy
- **On-Chain Publishing** — Mint your strategy as an ERC-721 NFT with keccak256 hash verification
- **Multi-Chain** — BSC Mainnet + opBNB with in-app network switching
- **PDF Export** — Download full analysis report as PDF
- **Demo Mode** — Try the full analysis flow without connecting a wallet

## Hackathon Tracks

- **DeFi** — Portfolio intelligence and yield optimization
- **AI** — Claude-powered strategy synthesis
- **opBNB** — Multi-chain deployment (BSC + opBNB)

## AI Build Log

See [AI_BUILD_LOG.md](./AI_BUILD_LOG.md) for a detailed account of how AI was used throughout development.

## License

MIT
