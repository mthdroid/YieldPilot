"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { connectWallet } from "@/lib/wallet";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/contract";
import { ethers } from "ethers";

export default function HomePage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ strategies: 0, protocols: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        if (REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") return;
        const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
        const [strategies, protocols] = await Promise.all([
          contract.totalStrategies(),
          contract.totalProtocolsAnalyzed(),
        ]);
        setStats({ strategies: Number(strategies), protocols: Number(protocols) });
      } catch {
        // Contract not deployed yet
      }
    }
    fetchStats();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const { address } = await connectWallet();
      router.push(`/dashboard?address=${address}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const handleDemo = () => {
    router.push("/dashboard?address=0x8894E0a0c962CB723c1ef8a1Bb26E95271Ff2b70&demo=true");
  };

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero with orb visual ───────────────────────────────────── */}
      <section className="relative pt-20 sm:pt-28 pb-32">
        {/* Ambient orbs */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#00d4aa]/[0.07] blur-[120px]" />
          <div className="absolute top-[100px] left-[20%] w-[300px] h-[300px] rounded-full bg-[#6c5ce7]/[0.05] blur-[100px]" />
          <div className="absolute top-[60px] right-[15%] w-[250px] h-[250px] rounded-full bg-[#0984e3]/[0.04] blur-[90px]" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--yp-surface)] border border-[var(--yp-border)] text-[12px] text-[var(--yp-text-secondary)] mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--yp-accent)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--yp-accent)]" />
            </span>
            BNB Chain Hackathon &mdash; DeFi Track
          </div>

          {/* Title */}
          <h1 className="text-[clamp(40px,7vw,72px)] font-bold tracking-[-0.04em] leading-[1.05] mb-6 animate-slide-up">
            Your DeFi Portfolio,
            <br />
            <span className="text-accent-gradient">Decoded by AI</span>
          </h1>

          <p className="text-[18px] leading-[1.6] text-[var(--yp-text-secondary)] max-w-[540px] mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Connect your wallet, get a full portfolio analysis across 8 risk modules,
            and publish your optimized strategy on-chain as an NFT.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary px-10 py-4 text-[16px] shadow-[0_0_40px_rgba(0,212,170,0.15)]">
              {connecting ? (
                <span className="flex items-center gap-2">
                  <span className="spinner !w-4 !h-4 !border-2 !border-[#131318]/30 !border-t-[#131318]" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 12V8H6a2 2 0 010-4h12v4" /><path d="M4 6v12a2 2 0 002 2h14v-4" /><circle cx="18" cy="16" r="1" fill="currentColor" />
                  </svg>
                  Connect Wallet
                </span>
              )}
            </button>
            <button onClick={handleDemo} className="btn-secondary px-10 py-4 text-[16px]">
              Try Demo
            </button>
          </div>

          {error && (
            <p className="mt-5 text-sm text-[var(--yp-danger)] bg-[var(--yp-danger)]/10 inline-block px-4 py-2 rounded-[var(--yp-radius-sm)]">
              {error}
            </p>
          )}

          {/* Floating preview card */}
          <div className="mt-16 max-w-[680px] mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="card p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--yp-accent)]/[0.03] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#0984e3] flex items-center justify-center text-[11px] font-bold text-white">AI</div>
                  <div>
                    <p className="text-[14px] font-semibold">Portfolio Analysis</p>
                    <p className="text-[12px] text-[var(--yp-muted)]">0x48f2...22D6</p>
                  </div>
                </div>
                <div className="badge badge-low text-[11px]">Score: 74</div>
              </div>
              {/* Fake module bars */}
              <div className="space-y-3">
                {[
                  { name: "Portfolio Health", w: "74%", color: "#40b68b" },
                  { name: "Yield Optimizer", w: "85%", color: "#40b68b" },
                  { name: "Protocol Risk", w: "68%", color: "#ffc46b" },
                  { name: "Concentration", w: "45%", color: "#ffc46b" },
                ].map((bar) => (
                  <div key={bar.name} className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--yp-muted)] w-[120px] shrink-0 text-right">{bar.name}</span>
                    <div className="flex-1 h-[6px] rounded-full bg-[var(--yp-surface-2)]">
                      <div className="h-[6px] rounded-full transition-all duration-1000" style={{ width: bar.w, backgroundColor: bar.color }} />
                    </div>
                    <span className="text-[11px] font-mono w-[32px]" style={{ color: bar.color }}>{bar.w.replace("%","")}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[var(--yp-border)] flex items-center justify-between">
                <p className="text-[12px] text-[var(--yp-muted)]">Recommended: Diversify into Venus lending</p>
                <span className="text-[12px] text-accent-gradient font-semibold">+5.2% APY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-28">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-8 border-y border-[var(--yp-border)]">
          {[
            { value: stats.strategies || "0", label: "Strategies Published" },
            { value: stats.protocols || "0", label: "Protocols Analyzed" },
            { value: "8", label: "Analysis Modules" },
            { value: "3", label: "Networks Supported" },
          ].map((s) => (
            <div key={s.label} className="text-center min-w-[140px]">
              <p className="text-[32px] font-bold tracking-[-0.02em] text-accent-gradient">{s.value}</p>
              <p className="text-[13px] text-[var(--yp-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works — horizontal flow ────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-28">
        <div className="text-center mb-14">
          <p className="text-[13px] font-medium text-[var(--yp-accent)] uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-[32px] font-bold tracking-[-0.03em]">Four steps to smarter DeFi</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M20 12V8H6a2 2 0 010-4h12v4" /><path d="M4 6v12a2 2 0 002 2h14v-4" /><circle cx="18" cy="16" r="1" fill="var(--yp-accent)"/>
              </svg>
            ), title: "Connect", desc: "Link your BSC wallet securely via MetaMask or any Web3 provider" },
            { icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            ), title: "Scan", desc: "We detect all your tokens, DeFi positions, and protocol interactions" },
            { icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            ), title: "Analyze", desc: "8 specialized modules + Claude AI generate personalized insights" },
            { icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
              </svg>
            ), title: "Publish", desc: "Mint your optimized strategy as a verifiable NFT on BNB Chain" },
          ].map((step, i) => (
            <div key={i} className="relative p-8 group">
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-[52px] right-0 w-[calc(100%-56px)] h-[1px] bg-gradient-to-r from-[var(--yp-accent)]/20 to-[var(--yp-accent)]/5 translate-x-[50%]" />
              )}
              <div className="w-12 h-12 rounded-2xl bg-[var(--yp-accent)]/[0.08] border border-[var(--yp-accent)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--yp-accent)]/[0.12] group-hover:border-[var(--yp-accent)]/20 transition-all">
                {step.icon}
              </div>
              <h3 className="text-[16px] font-semibold mb-2">{step.title}</h3>
              <p className="text-[13px] text-[var(--yp-text-secondary)] leading-[1.6]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules — two-column feature layout ───────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-28">
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-12 lg:gap-16 items-center">
          {/* Left: description */}
          <div>
            <p className="text-[13px] font-medium text-[var(--yp-accent)] uppercase tracking-widest mb-3">Intelligence</p>
            <h2 className="text-[32px] font-bold tracking-[-0.03em] leading-[1.15] mb-5">
              8 specialized modules,<br />one unified strategy
            </h2>
            <p className="text-[15px] text-[var(--yp-text-secondary)] leading-[1.7] mb-8">
              Every portfolio is analyzed through a pipeline of DeFi-specific detectors
              covering health, yield, risk, liquidation, and market conditions.
              Results are synthesized by Claude AI into actionable recommendations.
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary px-8 py-3.5 text-[15px]">
              {connecting ? "Connecting..." : "Analyze My Portfolio"}
            </button>
          </div>

          {/* Right: module grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Portfolio Health", desc: "Diversification scoring via Herfindahl index", color: "#40b68b" },
              { name: "Yield Optimizer", desc: "Find best APYs across Venus, PancakeSwap, Alpaca", color: "#00d4aa" },
              { name: "IL Tracker", desc: "Impermanent loss estimation on LP positions", color: "#ffc46b" },
              { name: "Liquidation Guard", desc: "Health factor monitoring for lending positions", color: "#fd766b" },
              { name: "Protocol Risk", desc: "TVL, audit status, and incident track record", color: "#6c5ce7" },
              { name: "Concentration", desc: "Single-token and single-protocol exposure alerts", color: "#0984e3" },
              { name: "Gas Optimizer", desc: "Rebalancing cost estimation and timing tips", color: "#74b9ff" },
              { name: "Market Sentiment", desc: "BNB ecosystem trend: bullish, neutral, bearish", color: "#fdcb6e" },
            ].map((m, i) => (
              <div key={i} className="card card-hover p-4 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full rounded-full" style={{ backgroundColor: m.color, opacity: 0.5 }} />
                <h3 className="text-[13px] font-semibold mb-1 pl-2">{m.name}</h3>
                <p className="text-[11px] text-[var(--yp-muted)] leading-[1.5] pl-2">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof / trust strip ────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-28">
        <div className="card p-8 sm:p-10 grid sm:grid-cols-3 gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--yp-accent)]/[0.02] via-transparent to-[#6c5ce7]/[0.02] pointer-events-none" />
          <div className="relative text-center">
            <p className="text-[14px] font-semibold mb-1.5">On-Chain Verified</p>
            <p className="text-[13px] text-[var(--yp-text-secondary)]">Every strategy is hashed and minted as an ERC-721 NFT on BNB Chain</p>
          </div>
          <div className="relative text-center">
            <p className="text-[14px] font-semibold mb-1.5">AI-Powered</p>
            <p className="text-[13px] text-[var(--yp-text-secondary)]">Claude AI synthesizes 8 analysis modules into personalized recommendations</p>
          </div>
          <div className="relative text-center">
            <p className="text-[14px] font-semibold mb-1.5">Works Without AI Key</p>
            <p className="text-[13px] text-[var(--yp-text-secondary)]">All 8 static modules run independently &mdash; AI enhancement is optional</p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-28">
        <div className="relative rounded-[28px] overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--yp-accent)]/[0.08] via-[#6c5ce7]/[0.04] to-[#0984e3]/[0.06]" />
          <div className="absolute inset-0 bg-[var(--yp-surface)]/80" />

          <div className="relative px-8 sm:px-16 py-16 sm:py-20 text-center">
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] mb-4">
              Ready to <span className="text-accent-gradient">optimize</span>?
            </h2>
            <p className="text-[16px] text-[var(--yp-text-secondary)] max-w-[420px] mx-auto mb-10">
              Free AI-powered analysis in under 30 seconds. No sign-up required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleConnect} disabled={connecting} className="btn-primary px-10 py-4 text-[16px] shadow-[0_0_60px_rgba(0,212,170,0.2)]">
                {connecting ? "Connecting..." : "Start Analysis"}
              </button>
              <button onClick={handleDemo} className="btn-secondary px-10 py-4 text-[16px]">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
