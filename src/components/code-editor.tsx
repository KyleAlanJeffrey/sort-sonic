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

function highlightCode(code: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(
    /(\/\/.*)/g,
    '<span class="syn-comment">$1</span>'
  );
  html = html.replace(
    /(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g,
    '<span class="syn-string">$1</span>'
  );
  html = html.replace(
    /\b(const|let|var|function|return|if|else|for|while|do|break|continue|new|typeof|instanceof|true|false|null|undefined)\b/g,
    '<span class="syn-keyword">$1</span>'
  );
  html = html.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="syn-number">$1</span>'
  );
  html = html.replace(
    /\b(compare|swap|length|get|set)\b/g,
    '<span class="syn-builtin">$1</span>'
  );
  html = html.replace(
    /\b([a-zA-Z_]\w*)\s*\(/g,
    '<span class="syn-fn">$1</span>('
  );

  return html;
}

// Header button for transport controls
function HeaderBtn({
  onClick,
  children,
  variant = "default",
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "accent" | "default" | "danger";
  disabled?: boolean;
}) {
  const variants = {
    accent: "text-accent hover:bg-accent/10",
    default: "text-foreground-muted hover:bg-surface-3 hover:text-foreground",
    danger: "text-swap hover:bg-swap/10",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded transition-all ${variants[variant]} disabled:opacity-30 disabled:pointer-events-none`}
    >
      {children}
    </button>
  );
}

export type TransportState = "idle" | "running" | "paused" | "complete";

type TransportControls = {
  state: TransportState;
  operationCount: number;
  onPlay: (code: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStep?: () => void;
  onStop: () => void;
  playLabel?: string;
};

type CodeEditorProps = {
  initialCode?: string;
  error: string | null;
  transport: TransportControls;
  readOnly?: boolean;
};

export function CodeEditor({
  initialCode,
  error,
  transport,
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode ?? DEFAULT_CODE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef(code);

  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
      codeRef.current = initialCode;
    }
  }, [initialCode]);

  const handlePlay = useCallback(() => {
    transport.onPlay(codeRef.current);
  }, [transport]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newCode = codeRef.current.substring(0, start) + "  " + codeRef.current.substring(end);
        setCode(newCode);
        codeRef.current = newCode;
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && transport.state === "idle") {
        e.preventDefault();
        handlePlay();
      }
    },
    [transport.state, handlePlay]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    codeRef.current = e.target.value;
  }, []);

  const syncScroll = useCallback(() => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      if (lineCountRef.current) lineCountRef.current.scrollTop = scrollTop;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
    }
  }, []);

  const lineCount = code.split("\n").length;
  const { state, operationCount, onPause, onResume, onStep, onStop, playLabel } = transport;
  const isIdle = state === "idle";
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isComplete = state === "complete";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
        {/* Header with transport controls */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-surface-2/50 gap-2">
          {/* Left: label + line count */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-accent shadow-[0_0_6px_var(--accent-glow)] animate-pulse" : isComplete ? "bg-sorted" : "bg-accent shadow-[0_0_4px_var(--accent-glow)]"}`} />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              Editor
            </span>
            <span className="text-[10px] font-mono text-foreground-muted/40">
              {lineCount}L
            </span>
          </div>

          {/* Center: transport buttons */}
          <div className="flex items-center gap-1">
            {isIdle && (
              <HeaderBtn onClick={handlePlay} variant="accent">
                {playLabel ?? "Run"}
              </HeaderBtn>
            )}
            {isRunning && (
              <>
                {onPause && (
                  <HeaderBtn onClick={onPause}>Pause</HeaderBtn>
                )}
                <HeaderBtn onClick={onStop} variant="danger">Stop</HeaderBtn>
              </>
            )}
            {isPaused && (
              <>
                {onResume && (
                  <HeaderBtn onClick={onResume} variant="accent">Resume</HeaderBtn>
                )}
                {onStep && (
                  <HeaderBtn onClick={onStep}>Step</HeaderBtn>
                )}
                <HeaderBtn onClick={onStop}>Reset</HeaderBtn>
              </>
            )}
            {isComplete && (
              <HeaderBtn onClick={onStop}>Reset</HeaderBtn>
            )}
          </div>

          {/* Right: ops counter + shortcut hint */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono text-foreground-muted tabular-nums tracking-wider">
              {operationCount.toLocaleString()} ops
            </span>
            {isIdle && (
              <span className="text-[10px] font-mono text-foreground-muted/30 hidden sm:block">
                {"\u2318"}+Enter
              </span>
            )}
          </div>
        </div>

        {/* Editor body */}
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

          <div className="w-px bg-border/40 my-3" />

          {/* Code area */}
          <div className="relative flex-1 overflow-hidden">
            <pre
              ref={highlightRef}
              className="absolute inset-0 h-72 font-mono text-sm leading-[1.6rem] p-4 pl-3 overflow-hidden pointer-events-none whitespace-pre-wrap wrap-break-word"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightCode(code) + "\n" }}
            />
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={syncScroll}
              spellCheck={false}
              readOnly={readOnly}
              className="relative w-full h-72 bg-transparent text-transparent caret-accent font-mono text-sm leading-[1.6rem] p-4 pl-3 resize-none focus:outline-none selection:bg-accent/20 placeholder:text-foreground-muted/30 z-10"
              placeholder="Write your sorting algorithm..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-swap/8 border border-swap/25 text-sm font-mono p-3.5 rounded-lg">
          <span className="shrink-0 text-swap font-bold text-[10px] tracking-wider mt-0.5">ERR</span>
          <span className="text-swap/90">{error}</span>
        </div>
      )}
    </div>
  );
}

// Export a helper to get code from the editor via ref
export { DEFAULT_CODE };
