"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { connectWallet } from "@/lib/wallet";
import { REGISTRY_ABI } from "@/lib/contract";

const PUBLISH_NETWORKS: Record<string, { name: string; chainId: number; registry: string; explorer: string; rpcUrl: string; hexChainId: string }> = {
  bsc: {
    name: "BSC",
    chainId: 56,
    registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
    explorer: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    hexChainId: "0x38",
  },
  opbnb: {
    name: "opBNB",
    chainId: 204,
    registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_OPBNB || "0x0000000000000000000000000000000000000000",
    explorer: "https://opbnbscan.com",
    rpcUrl: "https://opbnb-mainnet-rpc.bnbchain.org/",
    hexChainId: "0xcc",
  },
};
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

interface TokenInfo {
  symbol: string; name: string; balance: number; valueUSD: number; contract: string;
}
interface ModuleResult {
  name: string; score: number; risk: string; findings: string[]; data?: Record<string, unknown>;
}
interface AnalysisResult {
  summary: {
    address: string; totalValueUSD: number; riskScore: number;
    expectedAPY: number; protocolCount: number; tokenCount: number; strategyHash: string;
  };
  modules: ModuleResult[];
  aiAnalysis: {
    overallAssessment: string; riskScore: number; expectedAPY: number;
    topRecommendations: string[]; warnings: string[];
  };
  timestamp: number;
}

const COLORS = ["#00d4aa", "#6c5ce7", "#0984e3", "#fdcb6e", "#e17055", "#00b894", "#74b9ff", "#fd79a8"];

const RISK_COLORS: Record<string, string> = {
  low: "#40b68b", medium: "#ffc46b", high: "#fd766b", critical: "#fd5050",
};

// ─── Health Gauge ────────────────────────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const color = score > 70 ? "#40b68b" : score > 40 ? "#ffc46b" : "#fd766b";
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="var(--yp-surface-2)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="700">
          {score}
        </text>
        <text x="70" y="85" textAnchor="middle" fill="var(--yp-muted)" fontSize="11">
          / 100
        </text>
      </svg>
      <p className="text-[13px] font-medium mt-1" style={{ color }}>
        {score > 70 ? "Healthy" : score > 40 ? "Needs Attention" : "At Risk"}
      </p>
    </div>
  );
}

// ─── Module Card ─────────────────────────────────────────────────────
function ModuleCard({ module }: { module: ModuleResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="card card-hover card-interactive p-5"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold">{module.name}</h3>
        <span className={`badge badge-${module.risk} text-[11px]`}>{module.risk}</span>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1 h-[6px] rounded-full bg-[var(--yp-surface-2)]">
          <div
            className="h-[6px] rounded-full transition-all duration-700"
            style={{ width: `${module.score}%`, backgroundColor: RISK_COLORS[module.risk] || "var(--yp-muted)" }}
          />
        </div>
        <span className="text-[13px] font-mono font-semibold min-w-[28px] text-right" style={{ color: RISK_COLORS[module.risk] }}>
          {module.score}
        </span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--yp-border)]">
          {module.findings.map((f, i) => (
            <p key={i} className="text-[12px] text-[var(--yp-text-secondary)] leading-relaxed py-1 flex gap-2">
              <span className="text-[var(--yp-accent)] shrink-0">-</span>
              {f}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export / Dashboard Content ──────────────────────────────────────
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1200px] mx-auto px-4 py-24 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-[var(--yp-text-secondary)]">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address") || "";
  const isDemo = searchParams.get("demo") === "true";

  const [portfolio, setPortfolio] = useState<{ tokens: TokenInfo[]; totalValueUSD: number; protocols: string[] } | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishTx, setPublishTx] = useState("");
  const [publishNetwork, setPublishNetwork] = useState("bsc");
  const [error, setError] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (isDemo) {
        data.tokens = [
          { symbol: "BNB", name: "BNB", balance: 12.5, valueUSD: 7500, contract: "native" },
          { symbol: "USDT", name: "Tether USD", balance: 5000, valueUSD: 5000, contract: "0x55d398326f99059ff775485246999027b3197955" },
          { symbol: "CAKE", name: "PancakeSwap", balance: 800, valueUSD: 2000, contract: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82" },
          { symbol: "ETH", name: "Ethereum", balance: 0.5, valueUSD: 1600, contract: "0x2170ed0880ac9a755fd29b2688956bd959f933f8" },
          { symbol: "XVS", name: "Venus", balance: 50, valueUSD: 400, contract: "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63" },
        ];
        data.totalValueUSD = 16500;
        data.protocols = ["pancakeswap", "venus"];
      }

      setPortfolio(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  }, [address, isDemo]);

  const runAnalysis = useCallback(async () => {
    if (!portfolio) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          tokens: portfolio.tokens,
          protocols: portfolio.protocols,
          totalValueUSD: portfolio.totalValueUSD,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, [portfolio, address]);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);
  useEffect(() => { if (portfolio) runAnalysis(); }, [portfolio, runAnalysis]);

  const publishStrategy = async () => {
    if (!analysis) return;
    setPublishing(true);
    setError("");
    const net = PUBLISH_NETWORKS[publishNetwork];
    const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider & { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) { setError("No wallet found"); setPublishing(false); return; }
    try {
      // Switch to the target network
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: net.hexChainId }] });
      } catch (switchErr: unknown) {
        if ((switchErr as { code?: number }).code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: net.hexChainId, chainName: net.name, rpcUrls: [net.rpcUrl], nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 } }],
          });
        } else { throw switchErr; }
      }
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(net.registry, REGISTRY_ABI, signer);
      const tx = await contract.publishStrategy(address, analysis.summary.riskScore, analysis.summary.expectedAPY, analysis.summary.protocolCount || 1, analysis.summary.strategyHash, "", net.chainId);
      const receipt = await tx.wait();
      setPublishTx(`${net.explorer}/tx/${receipt.hash}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#131318", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`yieldpilot-${address.slice(0, 8)}-report.pdf`);
    } catch {
      setError("PDF export failed");
    }
  };

  if (!address) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-24 text-center">
        <h1 className="text-[24px] font-bold mb-3">No Wallet Connected</h1>
        <p className="text-[var(--yp-text-secondary)]">Connect your wallet from the home page to start analysis.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em]">Portfolio Dashboard</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] text-[var(--yp-text-secondary)] font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            {isDemo && <span className="badge badge-medium text-[10px]">Demo</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportPDF} disabled={!analysis} className="btn-secondary btn-sm disabled:opacity-30">
            Export PDF
          </button>
          {/* Network selector for publish */}
          <div className="flex bg-[var(--yp-surface)] rounded-[var(--yp-radius-sm)] p-0.5">
            {Object.entries(PUBLISH_NETWORKS).map(([key, net]) => (
              <button
                key={key}
                onClick={() => setPublishNetwork(key)}
                className={`px-3 py-1.5 rounded-[10px] text-[11px] font-medium transition-all ${
                  publishNetwork === key
                    ? "bg-[var(--yp-accent)] text-[#131318]"
                    : "text-[var(--yp-text-secondary)] hover:text-[var(--yp-text)]"
                }`}
              >
                {net.name}
              </button>
            ))}
          </div>
          <button
            onClick={publishStrategy}
            disabled={!analysis || publishing || PUBLISH_NETWORKS[publishNetwork].registry === "0x0000000000000000000000000000000000000000"}
            className="btn-primary btn-sm disabled:opacity-30"
          >
            {publishing ? "Publishing..." : `Publish on ${PUBLISH_NETWORKS[publishNetwork].name}`}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-[var(--yp-radius-sm)] border border-[var(--yp-danger)]/30 bg-[var(--yp-danger)]/5 text-[13px] text-[var(--yp-danger)]">
          {error}
        </div>
      )}
      {publishTx && (
        <div className="mb-6 p-4 rounded-[var(--yp-radius-sm)] border border-[var(--yp-success)]/30 bg-[var(--yp-success)]/5 text-[13px]">
          Strategy published!{" "}
          <a href={publishTx} target="_blank" rel="noopener noreferrer" className="text-[var(--yp-accent)] underline">
            View on Explorer
          </a>
        </div>
      )}

      {/* Loading */}
      {(loading || analyzing) && (
        <div className="text-center py-24">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[var(--yp-text-secondary)] text-[14px]">
            {loading ? "Fetching portfolio..." : "Running AI analysis..."}
          </p>
        </div>
      )}

      {/* Portfolio Overview */}
      {portfolio && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-slide-up">
          {/* Total Value */}
          <div className="card p-6">
            <p className="section-label">Total Portfolio Value</p>
            <p className="text-[32px] font-bold tracking-[-0.02em] text-accent-gradient">
              ${portfolio.totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="flex gap-4 mt-3">
              <span className="text-[12px] text-[var(--yp-text-secondary)]">{portfolio.tokens.length} tokens</span>
              <span className="text-[12px] text-[var(--yp-text-secondary)]">{portfolio.protocols.length} protocols</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card p-6">
            <p className="section-label">Allocation</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={portfolio.tokens.map(t => ({ name: t.symbol, value: t.valueUSD }))}
                  cx="50%" cy="50%" outerRadius={55} innerRadius={32}
                  dataKey="value" paddingAngle={3} strokeWidth={0}
                >
                  {portfolio.tokens.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--yp-surface-2)", border: "1px solid var(--yp-border)", borderRadius: "12px", fontSize: "12px", color: "var(--yp-text)" }}
                  formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Token List */}
          <div className="card p-6">
            <p className="section-label">Holdings</p>
            <div className="space-y-2.5 max-h-[155px] overflow-y-auto pr-1">
              {portfolio.tokens.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[13px] font-medium">{t.symbol}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] text-[var(--yp-muted)] mr-2">{t.balance.toFixed(2)}</span>
                    <span className="text-[13px] font-semibold">${t.valueUSD.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !analyzing && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="card p-6 flex flex-col items-center justify-center">
              <p className="section-label text-center">Health Score</p>
              <HealthGauge score={100 - analysis.summary.riskScore} />
            </div>
            <div className="card p-6">
              <p className="section-label">Risk Score</p>
              <p className="stat-value" style={{ color: analysis.summary.riskScore > 60 ? "#fd766b" : analysis.summary.riskScore > 30 ? "#ffc46b" : "#40b68b" }}>
                {analysis.summary.riskScore}
              </p>
              <p className="text-[12px] text-[var(--yp-text-secondary)] mt-1">
                {analysis.summary.riskScore > 60 ? "High risk" : analysis.summary.riskScore > 30 ? "Moderate risk" : "Low risk"}
              </p>
            </div>
            <div className="card p-6">
              <p className="section-label">Expected APY</p>
              <p className="stat-value text-accent-gradient">
                {(analysis.summary.expectedAPY / 100).toFixed(2)}%
              </p>
              <p className="text-[12px] text-[var(--yp-text-secondary)] mt-1">Optimized strategy</p>
            </div>
            <div className="card p-6">
              <p className="section-label">Coverage</p>
              <p className="stat-value text-[var(--yp-text)]">{analysis.summary.protocolCount}</p>
              <p className="text-[12px] text-[var(--yp-text-secondary)] mt-1">{analysis.summary.tokenCount} tokens analyzed</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card p-6 mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-[16px] font-semibold mb-4">Module Scores</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analysis.modules.map(m => ({ name: m.name, score: m.score }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "var(--yp-muted)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--yp-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--yp-surface-2)", border: "1px solid var(--yp-border)", borderRadius: "12px", fontSize: "12px", color: "var(--yp-text)" }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {analysis.modules.map((m, i) => (
                    <Cell key={i} fill={RISK_COLORS[m.risk] || "var(--yp-muted)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Module Cards */}
          <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-[16px] font-semibold mb-4">Detailed Analysis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {analysis.modules.map((m, i) => (
                <ModuleCard key={i} module={m} />
              ))}
            </div>
          </div>

          {/* AI Advisor */}
          <div className="card p-6 sm:p-8 mb-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-[var(--yp-radius-sm)] bg-[var(--yp-accent)]/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 className="text-[16px] font-semibold">AI Strategy Advisor</h2>
            </div>

            <div className="text-[14px] text-[var(--yp-text-secondary)] leading-[1.7] mb-6 whitespace-pre-line">
              {analysis.aiAnalysis.overallAssessment}
            </div>

            {analysis.aiAnalysis.topRecommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[13px] font-semibold mb-3 text-[var(--yp-accent)]">Recommendations</h3>
                <div className="space-y-2">
                  {analysis.aiAnalysis.topRecommendations.map((r, i) => (
                    <div key={i} className="flex gap-3 text-[13px]">
                      <span className="w-5 h-5 rounded-full bg-[var(--yp-accent)]/10 text-[var(--yp-accent)] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[var(--yp-text-secondary)] leading-relaxed">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.aiAnalysis.warnings.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold mb-3 text-[var(--yp-warning)]">Warnings</h3>
                <div className="space-y-2">
                  {analysis.aiAnalysis.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 text-[13px] text-[var(--yp-warning)]/80">
                      <span className="shrink-0">!</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strategy Hash */}
          <div className="card p-5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[var(--yp-muted)] mb-1">Strategy Hash</p>
                <p className="text-[11px] font-mono text-[var(--yp-text-secondary)] break-all">{analysis.summary.strategyHash}</p>
              </div>
              <p className="text-[11px] text-[var(--yp-muted)] shrink-0 ml-4">
                {new Date(analysis.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
