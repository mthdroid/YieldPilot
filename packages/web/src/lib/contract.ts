export const REGISTRY_ADDRESS = ((process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000").trim()) as `0x${string}`;

export const REGISTRY_ABI = [
  {
    inputs: [
      { name: "walletAnalyzed", type: "address" },
      { name: "riskScore", type: "uint8" },
      { name: "expectedAPY", type: "uint16" },
      { name: "protocolCount", type: "uint8" },
      { name: "strategyHash", type: "bytes32" },
      { name: "strategyURI", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    name: "publishStrategy",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getStrategy",
    outputs: [{
      components: [
        { name: "creator", type: "address" },
        { name: "walletAnalyzed", type: "address" },
        { name: "riskScore", type: "uint8" },
        { name: "expectedAPY", type: "uint16" },
        { name: "protocolCount", type: "uint8" },
        { name: "strategyHash", type: "bytes32" },
        { name: "strategyURI", type: "string" },
        { name: "timestamp", type: "uint256" },
        { name: "chainId", type: "uint256" },
      ],
      name: "", type: "tuple",
    }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStrategyCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStrategies",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalProtocolsAnalyzed",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "creator", type: "address" }],
    name: "getStrategiesByCreator",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
