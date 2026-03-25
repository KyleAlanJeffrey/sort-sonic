"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { algorithms } from "@/algorithms/metadata";

export function Navbar() {
  const pathname = usePathname();
  const [showAlgos, setShowAlgos] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isPlayground = pathname === "/playground";
  const isAlgorithm = pathname.startsWith("/algorithms/");
  const currentSlug = isAlgorithm ? pathname.split("/").pop() : null;
  const currentAlgo = currentSlug
    ? algorithms.find((a) => a.slug === currentSlug)
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAlgos(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowAlgos(false);
  }, [pathname]);

  return (
    <header className="border-b border-border/50 px-6 py-4 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)] group-hover:shadow-[0_0_14px_var(--accent)] transition-shadow" />
          <span className="text-lg font-bold tracking-wide uppercase">
            Sort<span className="text-accent">Sonic</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {/* Home */}
          <Link
            href="/"
            className={`relative px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-md transition-colors duration-200 ${
              isHome
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Home
            {isHome && <ActiveIndicator />}
          </Link>

          {/* Algorithms dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowAlgos((v) => !v)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-md transition-colors duration-200 ${
                isAlgorithm
                  ? "text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {currentAlgo ? currentAlgo.name : "Algorithms"}
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${showAlgos ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {isAlgorithm && <ActiveIndicator />}
            </button>

            {/* Dropdown */}
            {showAlgos && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden animate-fade-up"
                style={{ animationDuration: "150ms" }}
              >
                {algorithms.map((algo) => (
                  <Link
                    key={algo.slug}
                    href={`/algorithms/${algo.slug}`}
                    className={`flex items-center justify-between px-4 py-2.5 text-[11px] font-mono tracking-wider transition-colors ${
                      algo.slug === currentSlug
                        ? "bg-accent/10 text-accent"
                        : "text-foreground-muted hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <span className="uppercase">{algo.name}</span>
                    <span className="text-[9px] text-foreground-muted/40">
                      {algo.timeComplexity.average}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-border mx-1" />

          {/* Playground — primary CTA */}
          <Link
            href="/playground"
            className={`relative px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-md border transition-all duration-200 ${
              isPlayground
                ? "bg-accent/15 text-accent border-accent/40 shadow-[0_0_12px_var(--accent-dim)]"
                : "text-accent border-accent/20 hover:bg-accent/10 hover:border-accent/40 hover:shadow-[0_0_12px_var(--accent-dim)]"
            }`}
          >
            Playground
            {isPlayground && <ActiveIndicator />}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function ActiveIndicator() {
  return (
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-fade-up" />
  );
}
