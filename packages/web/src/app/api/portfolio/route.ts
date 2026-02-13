import { NextRequest, NextResponse } from "next/server";

const BSC_RPC = "https://bsc-dataseed.binance.org/";
const BSC_RPC_FALLBACK = "https://bsc-dataseed1.defibit.io/";
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
  // Venus
  "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63": "venus",
  "0xa07c5b74c9b40447a954e1466938b865b6bbea36": "venus",
  "0xeca88125a5adbe82614ffc12d0db554e2e2867c8": "venus",
  "0xfd5840cd36d94d7229439859c0112a4185bc0255": "venus",
  "0xfd36e2c2a6789db23113685031d7f16329158384": "venus", // Comptroller
  // PancakeSwap V2
  "0x10ed43c718714eb63d5aa57b78b54704e256024e": "pancakeswap", // V2 Router
  "0x73feaa1ee314f8c655e354234017be2193c9e24e": "pancakeswap", // MasterChef V2
  // PancakeSwap V3
  "0x13f4ea83d0bd40e75c8222255bc855a974568dd4": "pancakeswap", // V3 SmartRouter
  "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865": "pancakeswap", // V3 Factory
  "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364": "pancakeswap", // V3 NonfungiblePositionManager
  "0x556b9306565093c855aea9ae92a594704c2cd59e": "pancakeswap", // MasterChef V3
  // Alpaca
  "0xa625ab01b08ce023b2a342dbb12a16f2c8489a8f": "alpaca",
  // Stargate
  "0x4a364f8c717caad9a442737eb7b8a55cc6cf18d8": "stargate",
  "0x3052a0f6ab15b4ae1df39962d5ddefaca86dab47": "stargate", // Router
  // Thena
  "0xd4ae6eca985340dd434d38f470accce4dc78d109": "thena",
  "0x20a304a7d126758dfe6b243d0c075e5a31eb2e52": "thena", // Router
};

// NFT contracts for protocol detection (ERC-721 balanceOf check)
const PROTOCOL_NFT_CONTRACTS: Record<string, string> = {
  "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364": "pancakeswap", // V3 NonfungiblePositionManager
  "0xd4ae6eca985340dd434d38f470accce4dc78d109": "thena", // Thena positions
};

// Venus vToken contracts — holding vTokens means using Venus
const VENUS_VTOKENS: Record<string, string> = {
  "0xa07c5b74c9b40447a954e1466938b865b6bbea36": "vBNB",
  "0xeca88125a5adbe82614ffc12d0db554e2e2867c8": "vUSDC",
  "0xfd5840cd36d94d7229439859c0112a4185bc0255": "vUSDT",
  "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b": "vBTCB",
  "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8": "vETH",
};

// Fallback prices (used only if live fetch fails)
const FALLBACK_PRICES: Record<string, number> = {
  WBNB: 600, BNB: 600, USDT: 1, USDC: 1, BUSD: 1,
  ETH: 3200, BTCB: 95000, CAKE: 2.5, XVS: 8,
};

// Fetch live prices from CoinGecko
async function fetchLivePrices(): Promise<Record<string, number>> {
  try {
    const ids = "binancecoin,tether,usd-coin,binance-usd,ethereum,bitcoin,pancakeswap-token,venus";
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return FALLBACK_PRICES;
    const data = await res.json();
    return {
      WBNB: data.binancecoin?.usd || FALLBACK_PRICES.WBNB,
      BNB: data.binancecoin?.usd || FALLBACK_PRICES.BNB,
      USDT: data.tether?.usd || 1,
      USDC: data["usd-coin"]?.usd || 1,
      BUSD: data["binance-usd"]?.usd || 1,
      ETH: data.ethereum?.usd || FALLBACK_PRICES.ETH,
      BTCB: data.bitcoin?.usd || FALLBACK_PRICES.BTCB,
      CAKE: data["pancakeswap-token"]?.usd || FALLBACK_PRICES.CAKE,
      XVS: data.venus?.usd || FALLBACK_PRICES.XVS,
    };
  } catch {
    return FALLBACK_PRICES;
  }
}

// ─── RPC helpers ────────────────────────────────────────────────────
async function rpcCall(method: string, params: unknown[]): Promise<string> {
  for (const rpc of [BSC_RPC, BSC_RPC_FALLBACK]) {
    try {
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      });
      const data = await res.json();
      if (data.result !== undefined) return data.result;
    } catch {
      continue;
    }
  }
  return "0x0";
}

// Get native BNB balance via RPC
async function getBNBBalance(address: string): Promise<number> {
  const result = await rpcCall("eth_getBalance", [address, "latest"]);
  return parseInt(result, 16) / 1e18;
}

// Get ERC-20 token balance via RPC (balanceOf)
async function getTokenBalance(tokenContract: string, walletAddress: string, decimals: number): Promise<number> {
  const paddedAddress = walletAddress.slice(2).toLowerCase().padStart(64, "0");
  const data = `0x70a08231${paddedAddress}`;
  const result = await rpcCall("eth_call", [{ to: tokenContract, data }, "latest"]);
  if (!result || result === "0x" || result === "0x0") return 0;
  return parseInt(result, 16) / Math.pow(10, decimals);
}

// Get ERC-721 NFT balance via RPC (balanceOf — same selector as ERC-20)
async function getNFTBalance(nftContract: string, walletAddress: string): Promise<number> {
  const paddedAddress = walletAddress.slice(2).toLowerCase().padStart(64, "0");
  const data = `0x70a08231${paddedAddress}`;
  const result = await rpcCall("eth_call", [{ to: nftContract, data }, "latest"]);
  if (!result || result === "0x" || result === "0x0") return 0;
  return parseInt(result, 16);
}

// ─── BSCScan V2 (Etherscan unified API) — fallback for tx history ──
async function fetchTxHistory(address: string, action: string): Promise<unknown[]> {
  // Try Etherscan V2 first (unified API)
  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=account&action=${action}&address=${address}&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`
    );
    const data = await res.json();
    if (data.status === "1" && Array.isArray(data.result)) return data.result;
  } catch { /* V2 failed */ }

  // Fallback: try BSCScan V1 (may still work with valid API key)
  try {
    const res = await fetch(
      `https://api.bscscan.com/api?module=account&action=${action}&address=${address}&page=1&offset=100&sort=desc&apikey=${BSCSCAN_API_KEY}`
    );
    const data = await res.json();
    if (data.status === "1" && Array.isArray(data.result)) return data.result;
  } catch { /* V1 failed */ }

  return [];
}

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

    // Run all queries in parallel for speed
    const [prices, bnbBalance, ...tokenBalances] = await Promise.all([
      fetchLivePrices(),
      getBNBBalance(address),
      ...Object.entries(KNOWN_TOKENS).map(([contract, info]) =>
        getTokenBalance(contract, address, info.decimals).then(balance => ({
          contract, info, balance,
        }))
      ),
    ]);

    // 1. Add BNB if present
    if (bnbBalance > 0.0001) {
      tokens.push({
        symbol: "BNB",
        name: "BNB",
        balance: bnbBalance,
        valueUSD: bnbBalance * prices.BNB,
        contract: "native",
      });
    }

    // 2. Add known BEP-20 tokens with balance
    for (const { contract, info, balance } of tokenBalances) {
      if (balance > 0.0001) {
        const price = prices[info.symbol] || 0;
        tokens.push({
          symbol: info.symbol,
          name: info.name,
          balance,
          valueUSD: balance * price,
          contract,
        });
      }
    }

    // 3. Check NFT balances on protocol contracts (detect V3 LP positions etc.)
    const nftChecks = Object.entries(PROTOCOL_NFT_CONTRACTS).map(async ([contract, protocol]) => {
      const balance = await getNFTBalance(contract, address);
      if (balance > 0) detectedProtocols.add(protocol);
    });

    // 4. Check Venus vToken balances (holding vTokens = using Venus)
    const venusChecks = Object.entries(VENUS_VTOKENS).map(async ([contract]) => {
      const balance = await getTokenBalance(contract, address, 8); // vTokens use 8 decimals
      if (balance > 0.0001) detectedProtocols.add("venus");
    });

    await Promise.all([...nftChecks, ...venusChecks]);

    // 5. Fetch transaction history for additional protocol detection
    const [tokenTxs, normalTxs, nftTxs] = await Promise.all([
      fetchTxHistory(address, "tokentx"),
      fetchTxHistory(address, "txlist"),
      fetchTxHistory(address, "tokennfttx"),
    ]);

    // Detect protocols from token transfers
    for (const tx of tokenTxs as Array<Record<string, string>>) {
      const fromProto = PROTOCOL_CONTRACTS[tx.from?.toLowerCase()];
      const toProto = PROTOCOL_CONTRACTS[tx.to?.toLowerCase()];
      if (fromProto) detectedProtocols.add(fromProto);
      if (toProto) detectedProtocols.add(toProto);

      // Pick up unknown tokens from incoming transfers
      const contract = tx.contractAddress?.toLowerCase() || "";
      if (!KNOWN_TOKENS[contract] && !tokens.find(t => t.contract === contract)) {
        const symbol = tx.tokenSymbol || "UNKNOWN";
        const name = tx.tokenName || symbol;
        if (symbol !== "UNKNOWN" && tx.to?.toLowerCase() === address.toLowerCase()) {
          const decimals = parseInt(tx.tokenDecimal) || 18;
          const value = parseFloat(tx.value || "0") / Math.pow(10, decimals);
          if (value > 0) {
            tokens.push({ symbol, name, balance: value, valueUSD: 0, contract });
          }
        }
      }
    }

    // Detect protocols from normal transactions
    for (const tx of normalTxs as Array<Record<string, string>>) {
      const toProto = PROTOCOL_CONTRACTS[tx.to?.toLowerCase()];
      if (toProto) detectedProtocols.add(toProto);
    }

    // Detect protocols from NFT transfers
    for (const tx of nftTxs as Array<Record<string, string>>) {
      const contract = tx.contractAddress?.toLowerCase() || "";
      const fromProto = PROTOCOL_CONTRACTS[contract];
      const toProto = PROTOCOL_CONTRACTS[tx.to?.toLowerCase()];
      const fromAddrProto = PROTOCOL_CONTRACTS[tx.from?.toLowerCase()];
      if (fromProto) detectedProtocols.add(fromProto);
      if (toProto) detectedProtocols.add(toProto);
      if (fromAddrProto) detectedProtocols.add(fromAddrProto);
    }

    const totalValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0);

    return NextResponse.json({
      address,
      tokens: tokens.sort((a, b) => b.valueUSD - a.valueUSD),
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      protocols: Array.from(detectedProtocols),
      tokenCount: tokens.length,
      prices: { BNB: prices.BNB, ETH: prices.ETH, BTCB: prices.BTCB },
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portfolio fetch failed" },
      { status: 500 }
    );
  }
}
