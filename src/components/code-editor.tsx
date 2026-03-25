"use client";

import { useState, useRef, useCallback } from "react";

const DEFAULT_CODE = `// Write your sorting algorithm here!
// Available helpers:
//   compare(i, j) - returns true if arr[i] > arr[j]
//   swap(i, j)    - swaps elements at indices i and j
//   length        - the array length
//   get(i)        - get value at index i
//   set(i, value) - set value at index i
//
// Example: Bubble Sort
for (let i = 0; i < length; i++) {
  for (let j = 0; j < length - i - 1; j++) {
    if (compare(j, j + 1)) {
      swap(j, j + 1);
    }
  }
}
`;

type CodeEditorProps = {
  onRun: (code: string) => void;
  disabled: boolean;
  error: string | null;
};

export function CodeEditor({ onRun, disabled, error }: CodeEditorProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = useCallback(() => {
    onRun(code);
  }, [code, onRun]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newCode = code.substring(0, start) + "  " + code.substring(end);
        setCode(newCode);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !disabled) {
        e.preventDefault();
        handleRun();
      }
    },
    [code, disabled, handleRun]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-swap shadow-[0_0_4px_var(--swap-glow)]" />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              Editor
            </span>
          </div>
          <span className="text-[10px] font-mono text-foreground-muted/40">
            {"\u2318"}+Enter to run
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full h-64 bg-transparent text-foreground font-mono text-sm p-4 resize-none focus:outline-none selection:bg-accent/20"
          placeholder="Write your sorting algorithm..."
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-swap/5 border border-swap/20 text-swap text-xs font-mono p-3 rounded-lg">
          <span className="shrink-0 mt-px">ERR</span>
          <span className="text-swap/80">{error}</span>
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={disabled}
        className="self-start relative px-5 py-2.5 text-xs font-mono uppercase tracking-widest rounded-md transition-all duration-150 border bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_16px_var(--accent-glow)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {disabled ? "Running..." : "Run"}
      </button>
    </div>
  );
}
