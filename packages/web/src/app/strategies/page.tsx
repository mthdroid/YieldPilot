"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { REGISTRY_ABI } from "@/lib/contract";

interface Strategy {
  tokenId: number;
  creator: string;
  walletAnalyzed: string;
  riskScore: number;
  expectedAPY: number;
  protocolCount: number;
  strategyHash: string;
  strategyURI: string;
  timestamp: number;
  chainId: number;
}

const NETWORKS: Record<string, { name: string; rpc: string; explorer: string; chainId: number; registry: string }> = {
  bsc: { name: "BSC Mainnet", rpc: "https://bsc-dataseed.binance.org/", explorer: "https://bscscan.com", chainId: 56, registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000" },
  opbnb: { name: "opBNB", rpc: "https://opbnb-mainnet-rpc.bnbchain.org/", explorer: "https://opbnbscan.com", chainId: 204, registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_OPBNB || "0x0000000000000000000000000000000000000000" },
};

export default function StrategiesPage() {
  const [network, setNetwork] = useState("bsc");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [error, setError] = useState("");

  const registryAddress = NETWORKS[network].registry;

  const fetchStrategies = useCallback(async () => {
    setLoading(true);
    setError("");
    setStrategies([]);

    if (registryAddress === "0x0000000000000000000000000000000000000000") {
      setLoading(false);
      return;
    }

    try {
      const net = NETWORKS[network];
      const provider = new ethers.JsonRpcProvider(net.rpc);
      const contract = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);

      const count = Number(await contract.getStrategyCount());
      setTotalCount(count);

      const loaded: Strategy[] = [];
      const start = Math.max(1, count - 19);
      for (let i = count; i >= start; i--) {
        try {
          const s = await contract.getStrategy(i);
          loaded.push({
            tokenId: i,
            creator: s.creator,
            walletAnalyzed: s.walletAnalyzed,
            riskScore: Number(s.riskScore),
            expectedAPY: Number(s.expectedAPY),
            protocolCount: Number(s.protocolCount),
            strategyHash: s.strategyHash,
            strategyURI: s.strategyURI,
            timestamp: Number(s.timestamp),
            chainId: Number(s.chainId),
          });
        } catch {
          // Token may not exist on this network
        }
      }

      setStrategies(loaded);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch strategies");
    } finally {
      setLoading(false);
    }
  }, [network, registryAddress]);

  useEffect(() => { fetchStrategies(); }, [fetchStrategies]);

  const riskLabel = (score: number) =>
    score <= 30 ? "low" : score <= 60 ? "medium" : "high";

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em]">Strategy Explorer</h1>
          <p className="text-[14px] text-[var(--yp-text-secondary)] mt-1">
            Browse on-chain strategies published by the community
          </p>
        </div>
        {/* Network Switcher — pill toggle */}
        <div className="flex bg-[var(--yp-surface)] rounded-[var(--yp-radius)] p-1">
          {Object.entries(NETWORKS).map(([key, net]) => (
            <button
              key={key}
              onClick={() => setNetwork(key)}
              className={`px-4 py-1.5 rounded-[14px] text-[13px] font-medium transition-all ${
                network === key
                  ? "bg-[var(--yp-accent)] text-[#131318]"
                  : "text-[var(--yp-text-secondary)] hover:text-[var(--yp-text)]"
              }`}
            >
              {net.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <div className="card p-5 text-center">
          <p className="stat-value text-accent-gradient">{totalCount}</p>
          <p className="stat-label">Total Strategies</p>
        </div>
        <div className="card p-5 text-center">
          <p className="stat-value text-[var(--yp-text)]">{strategies.length}</p>
          <p className="stat-label">Loaded</p>
        </div>
        <div className="card p-5 text-center">
          <p className="stat-value text-[var(--yp-success)]">
            {strategies.length > 0 ? (strategies.reduce((s, st) => s + st.expectedAPY, 0) / strategies.length / 100).toFixed(1) : "0"}%
          </p>
          <p className="stat-label">Avg APY</p>
        </div>
        <div className="card p-5 text-center">
          <p className="stat-value text-[var(--yp-warning)]">
            {strategies.length > 0 ? Math.round(strategies.reduce((s, st) => s + st.riskScore, 0) / strategies.length) : 0}
          </p>
          <p className="stat-label">Avg Risk</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-[var(--yp-radius-sm)] border border-[var(--yp-danger)]/30 bg-[var(--yp-danger)]/5 text-[13px] text-[var(--yp-danger)]">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-24">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[var(--yp-text-secondary)] text-[14px]">Loading from {NETWORKS[network].name}...</p>
        </div>
      )}

      {/* No contract */}
      {!loading && registryAddress === "0x0000000000000000000000000000000000000000" && (
        <div className="text-center py-20 card">
          <div className="w-14 h-14 rounded-[var(--yp-radius)] bg-[var(--yp-surface-2)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-muted)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><circle cx="12" cy="16" r="0.5" fill="var(--yp-muted)" />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold mb-2">Contract Not Deployed</h2>
          <p className="text-[var(--yp-text-secondary)] text-[14px] max-w-md mx-auto">
            Set NEXT_PUBLIC_REGISTRY_ADDRESS in your .env after deployment.
          </p>
        </div>
      )}

      {/* No strategies */}
      {!loading && strategies.length === 0 && registryAddress !== "0x0000000000000000000000000000000000000000" && (
        <div className="text-center py-20 card">
          <div className="w-14 h-14 rounded-[var(--yp-radius)] bg-[var(--yp-surface-2)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--yp-accent)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold mb-2">No Strategies Yet</h2>
          <p className="text-[var(--yp-text-secondary)] text-[14px]">
            Be the first! Analyze your portfolio from the Dashboard.
          </p>
        </div>
      )}

      {/* Strategy List */}
      {!loading && strategies.length > 0 && (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {strategies.map((s) => (
            <div
              key={s.tokenId}
              className="card card-hover card-interactive p-5"
              onClick={() => setSelected(selected?.tokenId === s.tokenId ? null : s)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[var(--yp-radius-sm)] bg-[var(--yp-accent)]/10 flex items-center justify-center text-[13px] font-bold text-[var(--yp-accent)]">
                    #{s.tokenId}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">
                      Strategy by{" "}
                      <span className="font-mono text-[var(--yp-accent)]">
                        {s.creator.slice(0, 6)}...{s.creator.slice(-4)}
                      </span>
                    </p>
                    <p className="text-[12px] text-[var(--yp-muted)] mt-0.5">
                      {new Date(s.timestamp * 1000).toLocaleDateString()} &middot; Chain {s.chainId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-[11px] text-[var(--yp-muted)] mb-1">Risk</p>
                    <span className={`badge badge-${riskLabel(s.riskScore)} text-[11px]`}>{s.riskScore}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-[var(--yp-muted)] mb-1">APY</p>
                    <p className="text-[14px] font-semibold text-[var(--yp-success)]">
                      {(s.expectedAPY / 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-[var(--yp-muted)] mb-1">Protocols</p>
                    <p className="text-[14px] font-semibold">{s.protocolCount}</p>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {selected?.tokenId === s.tokenId && (
                <div className="mt-4 pt-4 border-t border-[var(--yp-border)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <p className="text-[var(--yp-muted)] mb-1">Wallet Analyzed</p>
                    <p className="font-mono text-[var(--yp-text-secondary)] break-all">{s.walletAnalyzed}</p>
                  </div>
                  <div>
                    <p className="text-[var(--yp-muted)] mb-1">Strategy Hash</p>
                    <p className="font-mono text-[var(--yp-text-secondary)] break-all">{s.strategyHash}</p>
                  </div>
                  {s.strategyURI && (
                    <div>
                      <p className="text-[var(--yp-muted)] mb-1">Strategy URI</p>
                      <a href={s.strategyURI} target="_blank" rel="noopener noreferrer" className="text-[var(--yp-accent)] underline">
                        {s.strategyURI}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-[var(--yp-muted)] mb-1">Explorer</p>
                    <a
                      href={`${NETWORKS[network].explorer}/token/${registryAddress}?a=${s.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--yp-accent)] underline"
                    >
                      View NFT #{s.tokenId}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
