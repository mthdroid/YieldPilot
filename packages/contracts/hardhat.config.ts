import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const RAW_KEY = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY = RAW_KEY.startsWith("0x") ? RAW_KEY : `0x${RAW_KEY}`;
const HAS_KEY = RAW_KEY.length >= 64;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    ...(HAS_KEY ? {
      bscTestnet: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        chainId: 97,
        accounts: [PRIVATE_KEY],
      },
      bsc: {
        url: "https://bsc-dataseed.binance.org/",
        chainId: 56,
        accounts: [PRIVATE_KEY],
      },
      opbnb: {
        url: "https://opbnb-mainnet-rpc.bnbchain.org/",
        chainId: 204,
        accounts: [PRIVATE_KEY],
      },
    } : {}),
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY,
    customChains: [
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL: "https://api-opbnb.bscscan.com/api",
          browserURL: "https://opbnbscan.com",
        },
      },
    ],
  },
  sourcify: { enabled: false },
};

export default config;
