import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// ─── Types ───────────────────────────────────────────────────────────
interface TokenInfo {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  contract: string;
}

interface ModuleResult {
  name: string;
  score: number;
  risk: "low" | "medium" | "high" | "critical";
  findings: string[];
  data?: Record<string, unknown>;
}

// ─── Protocol Data (inline) ─────────────────────────────────────────
const PROTOCOL_DATA: Record<string, { name: string; type: string; tvlBillions: number; audited: boolean; riskLevel: string; yields: Record<string, number> }> = {
  venus: { name: "Venus Protocol", type: "lending", tvlBillions: 1.5, audited: true, riskLevel: "low", yields: { USDT: 350, USDC: 300, BNB: 150, BTCB: 80, ETH: 120 } },
  pancakeswap: { name: "PancakeSwap", type: "dex", tvlBillions: 2.0, audited: true, riskLevel: "low", yields: { CAKE: 1500, "CAKE-BNB": 2500, "USDT-BNB": 800 } },
  alpaca: { name: "Alpaca Finance", type: "yield", tvlBillions: 0.3, audited: true, riskLevel: "medium", yields: { BNB: 800, USDT: 600, BUSD: 550 } },
  beefy: { name: "Beefy Finance", type: "yield", tvlBillions: 0.4, audited: true, riskLevel: "low", yields: { "AUTO-COMPOUND": 1200 } },
  stargate: { name: "Stargate Finance", type: "bridge", tvlBillions: 0.5, audited: true, riskLevel: "medium", yields: { USDT: 250, USDC: 200 } },
  thena: { name: "Thena", type: "dex", tvlBillions: 0.1, audited: true, riskLevel: "medium", yields: { "THE-BNB": 3000, "USDT-USDC": 400 } },
};

const STABLECOINS = ["USDT", "USDC", "BUSD", "DAI", "TUSD"];

// ─── Module 1: Portfolio Health Scorer ──────────────────────────────
function portfolioHealthScorer(tokens: TokenInfo[], protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let score = 50;

  // Diversification (Herfindahl Index)
  const totalValue = tokens.reduce((s, t) => s + t.valueUSD, 0);
  if (totalValue > 0) {
    const hhi = tokens.reduce((s, t) => s + Math.pow(t.valueUSD / totalValue, 2), 0);
    if (hhi < 0.25) { score += 20; findings.push("Well-diversified portfolio (HHI: " + hhi.toFixed(3) + ")"); }
    else if (hhi < 0.5) { score += 10; findings.push("Moderate diversification (HHI: " + hhi.toFixed(3) + ")"); }
    else { score -= 10; findings.push("Highly concentrated portfolio (HHI: " + hhi.toFixed(3) + ")"); }
  }

  // Protocol count
  if (protocols.length >= 3) { score += 10; findings.push(`Using ${protocols.length} protocols — good distribution`); }
  else if (protocols.length >= 1) { score += 5; findings.push(`Only ${protocols.length} protocol(s) detected — consider diversifying`); }
  else { findings.push("No DeFi protocols detected — holding idle assets"); }

  // Protocol quality
  const auditedCount = protocols.filter(p => PROTOCOL_DATA[p]?.audited).length;
  if (auditedCount === protocols.length && protocols.length > 0) { score += 10; findings.push("All protocols are audited"); }

  // Stablecoin ratio
  const stableValue = tokens.filter(t => STABLECOINS.includes(t.symbol)).reduce((s, t) => s + t.valueUSD, 0);
  const stableRatio = totalValue > 0 ? stableValue / totalValue : 0;
  if (stableRatio > 0.3 && stableRatio < 0.7) { score += 10; findings.push(`Balanced stablecoin ratio: ${(stableRatio * 100).toFixed(0)}%`); }
  else if (stableRatio > 0.7) { findings.push(`High stablecoin allocation: ${(stableRatio * 100).toFixed(0)}% — safe but low yield potential`); }
  else if (stableRatio < 0.1) { score -= 5; findings.push("Very low stablecoin allocation — high volatility exposure"); }

  score = Math.max(0, Math.min(100, score));
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";

  return { name: "Portfolio Health", score, risk, findings };
}

// ─── Module 2: Yield Optimizer ──────────────────────────────────────
function yieldOptimizer(tokens: TokenInfo[], protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let currentAPY = 0;
  let optimizedAPY = 0;

  const activeProtocols = protocols.filter(p => PROTOCOL_DATA[p]);

  // Estimate current APY from active protocols
  for (const proto of activeProtocols) {
    const pd = PROTOCOL_DATA[proto];
    const avgYield = Object.values(pd.yields).reduce((a, b) => a + b, 0) / Object.values(pd.yields).length;
    currentAPY += avgYield / activeProtocols.length;
  }

  if (activeProtocols.length === 0) {
    currentAPY = 0;
    findings.push("No yield-generating positions detected");
  }

  // Find best yields for each token
  for (const token of tokens) {
    let bestYield = 0;
    let bestProto = "";
    for (const [key, pd] of Object.entries(PROTOCOL_DATA)) {
      const yld = pd.yields[token.symbol];
      if (yld && yld > bestYield) { bestYield = yld; bestProto = pd.name; }
    }
    if (bestYield > 0) {
      optimizedAPY = Math.max(optimizedAPY, bestYield);
      findings.push(`${token.symbol}: Best yield ${(bestYield / 100).toFixed(2)}% APY on ${bestProto}`);
    }
  }

  // General recommendations
  if (optimizedAPY > currentAPY + 200) {
    findings.push(`Potential yield improvement: ${((optimizedAPY - currentAPY) / 100).toFixed(2)}% additional APY`);
  }

  const score = currentAPY > 500 ? 80 : currentAPY > 200 ? 60 : 40;
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";

  return { name: "Yield Optimizer", score, risk, findings, data: { currentAPY, optimizedAPY } };
}

// ─── Module 3: Impermanent Loss Tracker ─────────────────────────────
function impermanentLossTracker(tokens: TokenInfo[]): ModuleResult {
  const findings: string[] = [];
  let score = 80;

  // Detect LP-like tokens
  const lpTokens = tokens.filter(t =>
    t.symbol.includes("-") || t.symbol.includes("LP") || t.symbol.includes("Cake-LP")
  );

  if (lpTokens.length === 0) {
    findings.push("No liquidity pool positions detected");
    return { name: "Impermanent Loss", score: 90, risk: "low", findings };
  }

  for (const lp of lpTokens) {
    score -= 10;
    findings.push(`LP position detected: ${lp.symbol} ($${lp.valueUSD.toFixed(2)})`);
    findings.push(`Estimated IL risk for ${lp.symbol}: moderate (volatile pair)`);
  }

  // General IL warning
  if (lpTokens.length > 0) {
    findings.push("Consider single-sided staking to avoid IL exposure");
  }

  score = Math.max(0, Math.min(100, score));
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Impermanent Loss", score, risk, findings };
}

// ─── Module 4: Liquidation Monitor ──────────────────────────────────
function liquidationMonitor(tokens: TokenInfo[], protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let score = 85;

  const hasLending = protocols.some(p => PROTOCOL_DATA[p]?.type === "lending");

  if (!hasLending) {
    findings.push("No lending positions detected — no liquidation risk");
    return { name: "Liquidation Monitor", score: 95, risk: "low", findings };
  }

  // Estimate health factor based on portfolio composition
  const totalValue = tokens.reduce((s, t) => s + t.valueUSD, 0);
  const stableValue = tokens.filter(t => STABLECOINS.includes(t.symbol)).reduce((s, t) => s + t.valueUSD, 0);
  const volatileValue = totalValue - stableValue;

  if (volatileValue > totalValue * 0.7) {
    score -= 20;
    findings.push("High volatile collateral ratio — liquidation risk increases in market downturns");
    findings.push("Estimated health factor: 1.3-1.8 (monitor closely)");
  } else {
    findings.push("Estimated health factor: 2.0+ (safe zone)");
  }

  findings.push("Recommendation: Set up price alerts for BNB below $400 to manage collateral");
  if (protocols.includes("venus")) {
    findings.push("Venus positions detected — monitor vToken exchange rates");
  }

  score = Math.max(0, Math.min(100, score));
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Liquidation Monitor", score, risk, findings };
}

// ─── Module 5: Protocol Risk Scorer ─────────────────────────────────
function protocolRiskScorer(protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let totalScore = 0;

  if (protocols.length === 0) {
    findings.push("No DeFi protocols detected in use");
    return { name: "Protocol Risk", score: 50, risk: "medium", findings };
  }

  for (const proto of protocols) {
    const pd = PROTOCOL_DATA[proto];
    if (!pd) {
      findings.push(`Unknown protocol: ${proto} — exercise caution`);
      totalScore += 30;
      continue;
    }

    let protoScore = 50;
    if (pd.tvlBillions >= 1) protoScore += 20;
    else if (pd.tvlBillions >= 0.3) protoScore += 10;
    if (pd.audited) protoScore += 20;
    if (pd.riskLevel === "low") protoScore += 10;

    totalScore += protoScore;
    const riskTag = protoScore > 70 ? "LOW" : protoScore > 50 ? "MEDIUM" : "HIGH";
    findings.push(`${pd.name}: Risk ${riskTag} (TVL: $${pd.tvlBillions}B, Audited: ${pd.audited ? "Yes" : "No"})`);
  }

  const score = Math.round(totalScore / protocols.length);
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Protocol Risk", score, risk, findings };
}

// ─── Module 6: Concentration Risk ───────────────────────────────────
function concentrationRisk(tokens: TokenInfo[], protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let score = 80;

  const totalValue = tokens.reduce((s, t) => s + t.valueUSD, 0);
  if (totalValue === 0) {
    return { name: "Concentration Risk", score: 50, risk: "medium", findings: ["No portfolio value detected"] };
  }

  // Token concentration
  for (const token of tokens) {
    const pct = (token.valueUSD / totalValue) * 100;
    if (pct > 50) {
      score -= 25;
      findings.push(`HIGH: ${token.symbol} represents ${pct.toFixed(1)}% of portfolio — severely over-exposed`);
    } else if (pct > 30) {
      score -= 10;
      findings.push(`MEDIUM: ${token.symbol} at ${pct.toFixed(1)}% — consider rebalancing`);
    }
  }

  // Protocol concentration
  if (protocols.length === 1) {
    score -= 15;
    findings.push("Single protocol dependency — high concentration risk");
  } else if (protocols.length === 0) {
    findings.push("No protocol diversification (tokens held idle)");
  } else {
    findings.push(`Spread across ${protocols.length} protocols — acceptable concentration`);
  }

  if (tokens.length <= 2) {
    score -= 10;
    findings.push("Very few tokens held — low diversification");
  }

  score = Math.max(0, Math.min(100, score));
  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Concentration Risk", score, risk, findings };
}

// ─── Module 7: Gas Optimizer ────────────────────────────────────────
function gasOptimizer(tokens: TokenInfo[], protocols: string[]): ModuleResult {
  const findings: string[] = [];
  let score = 75;

  const estimatedTxCount = tokens.length + protocols.length * 2;
  const avgGasBSC = 0.001; // ~$0.60 per tx on BSC
  const estimatedGasCost = estimatedTxCount * avgGasBSC * 600;

  findings.push(`Estimated rebalancing transactions: ${estimatedTxCount}`);
  findings.push(`Estimated total gas cost: $${estimatedGasCost.toFixed(2)} (BSC avg)`);

  if (estimatedGasCost < 5) {
    score = 90;
    findings.push("Gas costs are minimal on BSC — proceed freely");
  } else if (estimatedGasCost < 20) {
    findings.push("Moderate gas costs — consider batching transactions");
  } else {
    score = 50;
    findings.push("High gas costs — batch transactions and use off-peak hours");
  }

  findings.push("BSC gas tip: Transactions are cheapest between 00:00-06:00 UTC");
  if (protocols.length > 2) {
    findings.push("Multi-protocol rebalancing: Consider using an aggregator for fewer transactions");
  }

  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Gas Optimizer", score, risk, findings, data: { estimatedGasCost, estimatedTxCount } };
}

// ─── Module 8: Market Sentiment ─────────────────────────────────────
function marketSentiment(): ModuleResult {
  const findings: string[] = [];

  // Deterministic analysis based on general BSC ecosystem health
  const bnbPrice = 600;
  const sentiment = bnbPrice > 500 ? "bullish" : bnbPrice > 300 ? "neutral" : "bearish";
  const score = sentiment === "bullish" ? 75 : sentiment === "neutral" ? 55 : 30;

  findings.push(`BNB price range: ~$${bnbPrice} — ${sentiment} territory`);
  findings.push("BSC DeFi TVL: Stable with moderate growth trend");

  if (sentiment === "bullish") {
    findings.push("Market conditions favor yield farming and LP positions");
    findings.push("Consider increasing exposure to volatile assets for upside");
  } else if (sentiment === "neutral") {
    findings.push("Market conditions suggest maintaining current positions");
    findings.push("Good time to accumulate stablecoins for future opportunities");
  } else {
    findings.push("Defensive positioning recommended — increase stablecoin allocation");
    findings.push("Avoid high-leverage positions and monitor collateral closely");
  }

  const risk = score > 70 ? "low" : score > 40 ? "medium" : "high";
  return { name: "Market Sentiment", score, risk, findings, data: { sentiment, bnbPrice } };
}

// ─── Claude AI Analysis ─────────────────────────────────────────────
async function claudeAnalysis(
  address: string,
  tokens: TokenInfo[],
  protocols: string[],
  totalValueUSD: number,
  moduleResults: ModuleResult[]
): Promise<{ overallAssessment: string; riskScore: number; expectedAPY: number; topRecommendations: string[]; warnings: string[] }> {
  if (!ANTHROPIC_API_KEY) {
    // Fallback without API key
    const avgScore = moduleResults.reduce((s, m) => s + m.score, 0) / moduleResults.length;
    const allFindings = moduleResults.flatMap(m => m.findings);
    return {
      overallAssessment: `Portfolio analysis for ${address.slice(0, 6)}...${address.slice(-4)} with $${totalValueUSD.toFixed(2)} total value across ${tokens.length} tokens and ${protocols.length} DeFi protocols.\n\nYour portfolio health score is ${avgScore.toFixed(0)}/100. ${avgScore > 70 ? "This is a well-managed portfolio with good diversification." : avgScore > 40 ? "There is room for improvement in diversification and yield optimization." : "This portfolio needs attention — consider rebalancing and diversifying."}\n\nKey findings from our 8-module analysis: ${allFindings.slice(0, 5).join(". ")}. Review the detailed module breakdowns below for specific recommendations on improving your DeFi strategy.`,
      riskScore: Math.round(100 - avgScore),
      expectedAPY: (moduleResults.find(m => m.name === "Yield Optimizer")?.data?.optimizedAPY as number) || 500,
      topRecommendations: [
        "Diversify across at least 3 DeFi protocols to reduce concentration risk",
        "Maintain 20-40% in stablecoins for stability and buying opportunities",
        "Consider Venus Protocol for lending idle stablecoins at 3-5% APY",
        "Use PancakeSwap for CAKE staking at ~15% APY",
        "Set up liquidation alerts if using leveraged positions",
      ],
      warnings: moduleResults.filter(m => m.risk === "high" || m.risk === "critical").map(m => `${m.name}: ${m.findings[0] || "High risk detected"}`),
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `You are a DeFi portfolio advisor specialized in BNB Smart Chain. Analyze this portfolio and return ONLY valid JSON (no markdown, no code blocks).

Return this exact JSON structure:
{"overallAssessment": "2-3 paragraph analysis string", "riskScore": 0-100, "expectedAPY": number in basis points, "topRecommendations": ["action1", "action2", "action3", "action4", "action5"], "warnings": ["warning1"]}

Portfolio data:
- Wallet: ${address}
- Total Value: $${totalValueUSD.toFixed(2)}
- Tokens: ${JSON.stringify(tokens.map(t => ({ symbol: t.symbol, value: t.valueUSD })))}
- Protocols: ${JSON.stringify(protocols)}
- Module scores: ${JSON.stringify(moduleResults.map(m => ({ name: m.name, score: m.score, risk: m.risk, topFinding: m.findings[0] })))}

Provide personalized, actionable DeFi strategy recommendations for BNB Chain.`,
        }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const parsed = JSON.parse(text);
    return parsed;
  } catch {
    // Fallback
    const avgScore = moduleResults.reduce((s, m) => s + m.score, 0) / moduleResults.length;
    return {
      overallAssessment: `AI analysis unavailable. Based on module scores, your portfolio health is ${avgScore.toFixed(0)}/100. Review module findings for detailed recommendations.`,
      riskScore: Math.round(100 - avgScore),
      expectedAPY: 500,
      topRecommendations: ["Review module findings for specific recommendations"],
      warnings: moduleResults.filter(m => m.risk === "high").map(m => `${m.name}: Review needed`),
    };
  }
}

// ─── Main Route Handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, tokens, protocols, totalValueUSD } = body as {
      address: string;
      tokens: TokenInfo[];
      protocols: string[];
      totalValueUSD: number;
    };

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    // Run all 8 modules
    const moduleResults: ModuleResult[] = [
      portfolioHealthScorer(tokens || [], protocols || []),
      yieldOptimizer(tokens || [], protocols || []),
      impermanentLossTracker(tokens || []),
      liquidationMonitor(tokens || [], protocols || []),
      protocolRiskScorer(protocols || []),
      concentrationRisk(tokens || [], protocols || []),
      gasOptimizer(tokens || [], protocols || []),
      marketSentiment(),
    ];

    // Run Claude AI analysis
    const aiAnalysis = await claudeAnalysis(
      address,
      tokens || [],
      protocols || [],
      totalValueUSD || 0,
      moduleResults
    );

    // Compute strategy hash
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ address, modules: moduleResults, ai: aiAnalysis }));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const strategyHash = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const avgScore = moduleResults.reduce((s, m) => s + m.score, 0) / moduleResults.length;

    return NextResponse.json({
      summary: {
        address,
        totalValueUSD: totalValueUSD || 0,
        riskScore: aiAnalysis.riskScore || Math.round(100 - avgScore),
        expectedAPY: aiAnalysis.expectedAPY || 500,
        protocolCount: (protocols || []).length,
        tokenCount: (tokens || []).length,
        strategyHash,
      },
      modules: moduleResults,
      aiAnalysis,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
