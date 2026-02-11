import { NextRequest, NextResponse } from "next/server";

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number; name: string }> = {
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": { symbol: "WBNB", decimals: 18, name: "Wrapped BNB" },
  "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT", decimals: 18, name: "Tether USD" },
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": { symbol: "USDC", decimals: 18, name: "USD Coin" },
  "0xe9e7cea3dedca5984780bafc599bd69add087d56": { symbol: "BUSD", decimals: 18, name: "Binance USD" },
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8": { symbol: "ETH", decimals: 18, name: "Ethereum" },
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": { symbol: "BTCB", decimals: 18, name: "Bitcoin BEP2" },
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": { symbol: "CAKE", decimals: 18, name: "PancakeSwap" },
  "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63": { symbol: "XVS", decimals: 18, name: "Venus" },
};

const PROTOCOL_CONTRACTS: Record<string, string> = {
  "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63": "venus",
  "0xa07c5b74c9b40447a954e1466938b865b6bbea36": "venus",
  "0xeca88125a5adbe82614ffc12d0db554e2e2867c8": "venus",
  "0xfd5840cd36d94d7229439859c0112a4185bc0255": "venus",
  "0x10ed43c718714eb63d5aa57b78b54704e256024e": "pancakeswap",
  "0x13f4ea83d0bd40e75c8222255bc855a974568dd4": "pancakeswap",
  "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865": "pancakeswap",
  "0xa625ab01b08ce023b2a342dbb12a16f2c8489a8f": "alpaca",
  "0x4a364f8c717caad9a442737eb7b8a55cc6cf18d8": "stargate",
  "0xd4ae6eca985340dd434d38f470accce4dc78d109": "thena",
};

// Rough USD prices for known tokens (fallback)
const TOKEN_PRICES: Record<string, number> = {
  WBNB: 600, BNB: 600, USDT: 1, USDC: 1, BUSD: 1,
  ETH: 3200, BTCB: 95000, CAKE: 2.5, XVS: 8,
};

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  contract: string;
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const tokens: TokenBalance[] = [];
    const detectedProtocols = new Set<string>();

    // 1. Fetch BNB balance via BSCScan
    try {
      const balanceRes = await fetch(
        `https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=${BSCSCAN_API_KEY}`
      );
      const balanceData = await balanceRes.json();
      if (balanceData.status === "1" && balanceData.result) {
        const bnbBalance = parseFloat(balanceData.result) / 1e18;
        if (bnbBalance > 0.0001) {
          tokens.push({
            symbol: "BNB",
            name: "BNB",
            balance: bnbBalance,
            valueUSD: bnbBalance * TOKEN_PRICES.BNB,
            contract: "native",
          });
        }
      }
    } catch {
      // BNB balance fetch failed
    }

    // 2. Fetch BEP-20 token transfers to detect holdings
    try {
      const txRes = await fetch(
        `https://api.bscscan.com/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`
      );
      const txData = await txRes.json();
      if (txData.status === "1" && Array.isArray(txData.result)) {
        const tokenBalances: Record<string, { symbol: string; name: string; decimals: number; contract: string; net: bigint }> = {};

        for (const tx of txData.result) {
          const contract = tx.contractAddress?.toLowerCase() || "";
          const known = KNOWN_TOKENS[contract];
          const symbol = known?.symbol || tx.tokenSymbol || "UNKNOWN";
          const name = known?.name || tx.tokenName || symbol;
          const decimals = known?.decimals || parseInt(tx.tokenDecimal) || 18;

          if (!tokenBalances[contract]) {
            tokenBalances[contract] = { symbol, name, decimals, contract, net: BigInt(0) };
          }

          const value = BigInt(tx.value || "0");
          if (tx.to?.toLowerCase() === address.toLowerCase()) {
            tokenBalances[contract].net += value;
          } else if (tx.from?.toLowerCase() === address.toLowerCase()) {
            tokenBalances[contract].net -= value;
          }

          // Detect protocol interactions
          const fromProto = PROTOCOL_CONTRACTS[tx.from?.toLowerCase()];
          const toProto = PROTOCOL_CONTRACTS[tx.to?.toLowerCase()];
          if (fromProto) detectedProtocols.add(fromProto);
          if (toProto) detectedProtocols.add(toProto);
        }

        for (const [, data] of Object.entries(tokenBalances)) {
          if (data.net > BigInt(0)) {
            const balance = parseFloat(data.net.toString()) / Math.pow(10, data.decimals);
            if (balance > 0.0001) {
              const price = TOKEN_PRICES[data.symbol] || 0;
              tokens.push({
                symbol: data.symbol,
                name: data.name,
                balance,
                valueUSD: balance * price,
                contract: data.contract,
              });
            }
          }
        }
      }
    } catch {
      // Token tx fetch failed
    }

    // 3. Fetch normal txns to detect more protocol interactions
    try {
      const normRes = await fetch(
        `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&page=1&offset=50&sort=desc&apikey=${BSCSCAN_API_KEY}`
      );
      const normData = await normRes.json();
      if (normData.status === "1" && Array.isArray(normData.result)) {
        for (const tx of normData.result) {
          const toProto = PROTOCOL_CONTRACTS[tx.to?.toLowerCase()];
          if (toProto) detectedProtocols.add(toProto);
        }
      }
    } catch {
      // Normal tx fetch failed
    }

    const totalValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0);

    return NextResponse.json({
      address,
      tokens: tokens.sort((a, b) => b.valueUSD - a.valueUSD),
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      protocols: Array.from(detectedProtocols),
      tokenCount: tokens.length,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portfolio fetch failed" },
      { status: 500 }
    );
  }
}
