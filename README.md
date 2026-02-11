# YieldPilot — AI-Powered DeFi Portfolio Intelligence

> **BNB Chain Hackathon — Good Vibes Only: OpenClaw Edition**

YieldPilot connects your wallet, scans your DeFi positions across BSC protocols, runs 8 specialized analysis modules, synthesizes results with Claude AI, and lets you publish your optimized strategy on-chain as a verifiable NFT.

## Live Contracts

| Network | Address | Explorer |
|---------|---------|----------|
| BSC Mainnet | `0xF5726c5D8C47A9B278e610917E9c7191bc3e135E` | [BSCScan](https://bscscan.com/address/0xF5726c5D8C47A9B278e610917E9c7191bc3e135E#code) |
| opBNB | `0xFED653FBE3371E11243A4772589A2cA3Aea859F0` | [opBNBScan](https://opbnbscan.com/address/0xFED653FBE3371E11243A4772589A2cA3Aea859F0#code) |

Both contracts are verified with full source code.

## On-Chain Proof (Test Transactions)

| Network | TX Hash | Explorer |
|---------|---------|----------|
| BSC Mainnet | `0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d` | [BSCScan](https://bscscan.com/tx/0x6b8e8f703cf8d975d7891f7cbee58a67cb3d4801e37fcfb4c013673e3410d91d) |
| opBNB | `0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5` | [opBNBScan](https://opbnbscan.com/tx/0x85001d9e508cc72e278876cbb7df3cb58563bb9488ef75dc503867d9889316c5) |

## Architecture

```
YieldPilot/
├── packages/
│   ├── contracts/          # Solidity — ERC-721 StrategyRegistry
│   │   ├── contracts/
│   │   ├── test/           # 17 unit tests (Hardhat + Chai)
│   │   └── scripts/
│   └── web/                # Next.js 14 App Router
│       ├── src/app/
│       │   ├── page.tsx          # Landing page
│       │   ├── dashboard/        # Portfolio analysis dashboard
│       │   ├── strategies/       # On-chain strategy explorer
│       │   └── api/
│       │       ├── analyze/      # 8 DeFi modules + AI synthesis
│       │       └── portfolio/    # BSCScan portfolio scanner
│       └── src/lib/              # Wallet, contract, protocol configs
```

## 8 Analysis Modules

| Module | What it does |
|--------|-------------|
| Portfolio Health | Diversification scoring via Herfindahl index |
| Yield Optimizer | Best APYs across Venus, PancakeSwap, Alpaca, Beefy |
| IL Tracker | Impermanent loss estimation on LP positions |
| Liquidation Guard | Health factor monitoring for lending positions |
| Protocol Risk | TVL, audit status, and incident history |
| Concentration Risk | Single-token and single-protocol exposure alerts |
| Gas Optimizer | Rebalancing cost estimation |
| Market Sentiment | BNB ecosystem trend analysis |

All modules run **without** an AI key. When an Anthropic API key is provided, Claude AI synthesizes results into personalized recommendations.

## Tech Stack

- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin v5, Hardhat
- **Frontend**: Next.js 14, Tailwind CSS, ethers.js v6, Recharts
- **AI**: Claude API (Anthropic) — optional enhancement
- **On-Chain**: ERC-721 NFT minting on BSC & opBNB
- **Export**: PDF report generation (jsPDF + html2canvas)

## Getting Started

```bash
# Install
npm install

# Run contract tests (17 tests)
npm test

# Start dev server
npm run dev:web
```

Copy `.env.example` to `.env` and fill in your keys.

## Deployment

```bash
# Deploy contracts
npm run deploy:mainnet    # BSC
npm run deploy:opbnb      # opBNB

# Verify
cd packages/contracts
npx hardhat verify --network bsc <address>
npx hardhat verify --network opbnb <address>
```

## Key Features

- **Connect & Scan** — MetaMask wallet connection, automatic portfolio detection via BSCScan API
- **8-Module Analysis** — Each module produces independent risk/opportunity scores
- **AI Synthesis** — Claude AI combines all module outputs into actionable strategy
- **On-Chain Publishing** — Mint your strategy as an ERC-721 NFT with strategy hash verification
- **Multi-Chain** — BSC Mainnet + opBNB supported
- **PDF Export** — Download full analysis report as PDF
- **Demo Mode** — Try with a sample wallet without connecting

## Hackathon Tracks

- **DeFi** — Portfolio intelligence and yield optimization
- **AI** — Claude-powered strategy synthesis
- **opBNB** — Multi-chain deployment (BSC + opBNB)

## AI Build Log

See [AI_BUILD_LOG.md](./AI_BUILD_LOG.md) for a detailed account of how AI was used throughout development.

## License

MIT
