import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "YieldPilot — AI-Powered DeFi Intelligence for BNB Chain",
  description: "Connect your wallet. Get personalized yield strategies and risk analysis powered by AI on BNB Smart Chain.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "YieldPilot — AI-Powered DeFi Intelligence",
    description: "8 analysis modules + Claude AI synthesize your DeFi portfolio into an optimized, on-chain verifiable strategy on BNB Chain.",
    type: "website",
    siteName: "YieldPilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "YieldPilot — AI-Powered DeFi Intelligence",
    description: "8 analysis modules + Claude AI synthesize your DeFi portfolio into an optimized, on-chain verifiable strategy on BNB Chain.",
  },
};

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="url(#yp-grad)" />
      <path d="M9 17L14 9L19 17" stroke="#131318" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="19.5" r="1.5" fill="#131318" />
      <defs>
        <linearGradient id="yp-grad" x1="0" y1="0" x2="28" y2="28">
          <stop stopColor="#00d4aa" />
          <stop offset="1" stopColor="#00b894" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="glow-bg" />

          {/* Nav — Uniswap style: clean, compact, with pill nav links */}
          <nav className="sticky top-0 z-50 bg-[var(--yp-bg)]/80 backdrop-blur-xl border-b border-[var(--yp-border)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between h-[64px]">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <Logo />
                    <span className="text-[17px] font-bold text-[var(--yp-text)]">YieldPilot</span>
                  </Link>

                  <div className="hidden sm:flex items-center bg-[var(--yp-surface)] rounded-[var(--yp-radius)] p-1">
                    <Link
                      href="/dashboard"
                      className="px-4 py-1.5 rounded-[14px] text-[13px] font-medium text-[var(--yp-text-secondary)] hover:text-[var(--yp-text)] hover:bg-[var(--yp-surface-2)] transition-all"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/strategies"
                      className="px-4 py-1.5 rounded-[14px] text-[13px] font-medium text-[var(--yp-text-secondary)] hover:text-[var(--yp-text)] hover:bg-[var(--yp-surface-2)] transition-all"
                    >
                      Strategies
                    </Link>
                  </div>
                </div>

                {/* Right: Chain badge + GitHub */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/YieldPilot/yieldpilot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-[var(--yp-radius-sm)] bg-[var(--yp-surface)] flex items-center justify-center text-[var(--yp-text-secondary)] hover:text-[var(--yp-text)] hover:bg-[var(--yp-surface-2)] transition-all"
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                  <div className="badge badge-info text-[11px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[var(--yp-accent)] mr-1.5 animate-pulse" />
                    BNB Chain
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="relative z-10">{children}</main>

          <footer className="relative z-10 border-t border-[var(--yp-border)] mt-24">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Logo />
                <span className="text-sm font-medium text-[var(--yp-text-secondary)]">
                  YieldPilot v1.0
                </span>
              </div>
              <p className="text-[12px] text-[var(--yp-muted)]">
                AI-Powered DeFi Portfolio Intelligence &middot; Built on BNB Chain
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
