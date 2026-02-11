export interface ProtocolConfig {
  name: string;
  type: "lending" | "dex" | "yield" | "staking" | "bridge";
  contracts: string[];
  riskLevel: "low" | "medium" | "high";
  tvlBillions?: number;
  audited: boolean;
  description: string;
}

export const BSC_PROTOCOLS: Record<string, ProtocolConfig> = {
  venus: {
    name: "Venus Protocol",
    type: "lending",
    contracts: [
      "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
      "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
      "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
      "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    ],
    riskLevel: "low",
    tvlBillions: 1.5,
    audited: true,
    description: "Largest lending protocol on BSC. Borrow/lend with variable rates.",
  },
  pancakeswap: {
    name: "PancakeSwap",
    type: "dex",
    contracts: [
      "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
      "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    ],
    riskLevel: "low",
    tvlBillions: 2.0,
    audited: true,
    description: "Largest DEX on BSC. AMM, farms, and lottery.",
  },
  alpaca: {
    name: "Alpaca Finance",
    type: "yield",
    contracts: [
      "0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F",
    ],
    riskLevel: "medium",
    tvlBillions: 0.3,
    audited: true,
    description: "Leveraged yield farming on BSC.",
  },
  beefy: {
    name: "Beefy Finance",
    type: "yield",
    contracts: [],
    riskLevel: "low",
    tvlBillions: 0.4,
    audited: true,
    description: "Multi-chain yield optimizer. Auto-compounds farm rewards.",
  },
  stargate: {
    name: "Stargate Finance",
    type: "bridge",
    contracts: [
      "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8",
    ],
    riskLevel: "medium",
    tvlBillions: 0.5,
    audited: true,
    description: "Cross-chain bridge powered by LayerZero.",
  },
  thena: {
    name: "Thena",
    type: "dex",
    contracts: [
      "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
    ],
    riskLevel: "medium",
    tvlBillions: 0.1,
    audited: true,
    description: "ve(3,3) DEX on BSC. Concentrated liquidity + voting.",
  },
};

export const BSC_TOKENS: Record<string, { symbol: string; decimals: number; name: string }> = {
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { symbol: "WBNB", decimals: 18, name: "Wrapped BNB" },
  "0x55d398326f99059fF775485246999027B3197955": { symbol: "USDT", decimals: 18, name: "Tether USD" },
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": { symbol: "USDC", decimals: 18, name: "USD Coin" },
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": { symbol: "BUSD", decimals: 18, name: "Binance USD" },
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8": { symbol: "ETH", decimals: 18, name: "Ethereum" },
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c": { symbol: "BTCB", decimals: 18, name: "Bitcoin BEP2" },
  "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82": { symbol: "CAKE", decimals: 18, name: "PancakeSwap" },
  "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63": { symbol: "XVS", decimals: 18, name: "Venus" },
};
