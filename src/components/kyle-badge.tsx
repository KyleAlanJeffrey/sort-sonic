"use client";

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const positionClasses: Record<Position, string> = {
  "bottom-right": "bottom-5 right-5",
  "bottom-left": "bottom-5 left-5",
  "top-right": "top-20 right-5",
  "top-left": "top-20 left-5",
};

export function KyleBadge({ position = "bottom-right" }: { position?: Position }) {
  return (
    <a
      href="https://kylejeffrey.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed z-50 group ${positionClasses[position]}`}
    >
      <div className="relative px-4 py-2 rounded-lg border border-white/10 bg-black/70 backdrop-blur-md shadow-lg shadow-black/30 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:scale-105">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <div className="relative flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/40 tracking-wider uppercase">
            built by
          </span>
          <span className="text-sm font-bold tracking-wide text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 transition-all duration-300">
            Kyle
          </span>
        </div>
      </div>
    </a>
  );
}
