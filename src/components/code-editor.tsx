"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_CODE = `// Write your sorting algorithm here!
// Available helpers:
//   compare(i, j) - returns true if arr[i] > arr[j]
//   swap(i, j)    - swaps elements at indices i and j
//   length        - the array length
//   get(i)        - get value at index i
//   set(i, value) - set value at index i

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
  initialCode?: string;
};

export function CodeEditor({ onRun, disabled, error, initialCode }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode ?? DEFAULT_CODE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);

  // Sync code when initialCode changes (algorithm selected)
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

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

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineCountRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const lineCount = code.split("\n").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_var(--accent-glow)]" />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              Editor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-foreground-muted/50">
              {lineCount} lines
            </span>
            <span className="text-[10px] font-mono text-foreground-muted/40">
              {"\u2318"}+Enter to run
            </span>
          </div>
        </div>

        {/* Editor body with line numbers */}
        <div className="flex relative">
          {/* Line numbers */}
          <div
            ref={lineCountRef}
            className="shrink-0 py-4 pl-3 pr-2 text-right select-none overflow-hidden"
            style={{ width: 44 }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-[11px] font-mono leading-[1.6rem] text-foreground-muted/30"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px bg-border/40 my-3" />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            className="flex-1 h-72 bg-transparent text-foreground font-mono text-sm leading-[1.6rem] p-4 pl-3 resize-none focus:outline-none selection:bg-accent/20 placeholder:text-foreground-muted/30"
            placeholder="Write your sorting algorithm..."
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-swap/8 border border-swap/25 text-sm font-mono p-3.5 rounded-lg">
          <span className="shrink-0 text-swap font-bold text-[10px] tracking-wider mt-0.5">ERR</span>
          <span className="text-swap/90">{error}</span>
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={disabled}
        className="self-start relative px-6 py-2.5 text-xs font-mono uppercase tracking-widest rounded-lg border transition-all duration-150 bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_16px_var(--accent-glow)] disabled:opacity-30"
      >
        {disabled ? "Running..." : "Run"}
      </button>
    </div>
  );
}
