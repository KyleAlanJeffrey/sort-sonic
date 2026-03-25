"use client";

import { algorithms } from "@/algorithms/metadata";

type AlgorithmPickerProps = {
  selected: string;
  onSelect: (slug: string) => void;
  disabled: boolean;
  showCustom?: boolean;
  onCustomSelect?: () => void;
};

export function AlgorithmPicker({
  selected,
  onSelect,
  disabled,
  showCustom = false,
  onCustomSelect,
}: AlgorithmPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {algorithms.map((algo) => {
        const isSelected = selected === algo.slug;
        return (
          <button
            key={algo.slug}
            onClick={() => onSelect(algo.slug)}
            disabled={disabled}
            className={`
              relative px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider
              rounded-md border transition-all duration-200
              ${
                isSelected
                  ? "bg-accent/10 text-accent border-accent/40 shadow-[0_0_12px_var(--accent-dim)]"
                  : "bg-surface-2 text-foreground-muted border-border hover:text-foreground hover:border-border-bright"
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {isSelected && (
              <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]" />
            )}
            {algo.name}
          </button>
        );
      })}
      {showCustom && (
        <button
          onClick={onCustomSelect}
          disabled={disabled}
          className={`
            relative px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider
            rounded-md border transition-all duration-200
            ${
              selected === "custom"
                ? "bg-accent/10 text-accent border-accent/40 shadow-[0_0_12px_var(--accent-dim)]"
                : "bg-surface-2 text-foreground-muted border-border hover:text-foreground hover:border-border-bright"
            }
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
        >
          {selected === "custom" && (
            <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]" />
          )}
          Custom
        </button>
      )}
    </div>
  );
}
