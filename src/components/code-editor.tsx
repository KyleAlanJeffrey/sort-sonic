"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";

const DEFAULT_CODE = `for (let i = 0; i < length; i++) {
  for (let j = 0; j < length - i - 1; j++) {
    if (compare(j, j + 1)) {
      swap(j, j + 1);
    }
  }
}
`;

export function highlightCode(code: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/(\/\/.*)/g, '<span class="syn-comment">$1</span>');
  html = html.replace(/(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g, '<span class="syn-string">$1</span>');
  html = html.replace(/\b(const|let|var|function|return|if|else|for|while|do|break|continue|new|typeof|instanceof|true|false|null|undefined)\b/g, '<span class="syn-keyword">$1</span>');
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>');
  html = html.replace(/\b(compare|swap|length|get|set)\b/g, '<span class="syn-builtin">$1</span>');
  html = html.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="syn-fn">$1</span>(');

  return html;
}

// Shared editor body (line numbers + highlighted textarea)
type EditorBodyProps = {
  code: string;
  onCodeChange: (code: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
};

function EditorBody({ code, onCodeChange, onKeyDown, readOnly }: EditorBodyProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const syncScroll = useCallback(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (lineCountRef.current) lineCountRef.current.scrollTop = scrollTop;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
    }
  }, []);

  const lineCount = code.split("\n").length;

  return (
    <div className="flex relative">
      <div
        ref={lineCountRef}
        className="shrink-0 py-4 pl-3 pr-2 text-right select-none"
        style={{ width: 44 }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="text-[11px] font-mono leading-[1.6rem] text-foreground-muted/30">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="w-px bg-border/40 my-3" />
      <div className="relative flex-1">
        <pre
          ref={highlightRef}
          className="absolute inset-0 font-mono text-sm leading-[1.6rem] p-4 pl-3 overflow-auto pointer-events-none whitespace-pre-wrap wrap-break-word"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) + "\n" }}
        />
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          readOnly={readOnly}
          className="relative w-full min-h-72 bg-transparent text-transparent caret-accent font-mono text-sm leading-[1.6rem] p-4 pl-3 resize-y focus:outline-none selection:bg-accent/20 placeholder:text-foreground-muted/30 z-10"
          placeholder="Write your sorting algorithm..."
          style={{ height: Math.max(288, (code.split("\n").length + 2) * 25.6) }}
        />
      </div>
    </div>
  );
}

// Transport button used in headers
export function TransportBtn({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "accent" | "default" | "danger";
}) {
  const variants = {
    accent: "bg-accent/15 text-accent border-accent/40 hover:bg-accent/25 hover:shadow-[0_0_10px_var(--accent-dim)]",
    default: "bg-surface-3/80 text-foreground-muted border-border-bright hover:bg-surface-3 hover:text-foreground",
    danger: "bg-swap/15 text-swap border-swap/40 hover:bg-swap/25",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded-md border transition-all ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

// Wrapper shell: header slot + editor body + error
type EditorShellProps = {
  code: string;
  onCodeChange: (code: string) => void;
  onCmdEnter: () => void;
  readOnly?: boolean;
  error: string | null;
  header: ReactNode;
};

export function EditorShell({ code, onCodeChange, onCmdEnter, readOnly, error, header }: EditorShellProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab" && !readOnly) {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newCode = code.substring(0, start) + "  " + code.substring(end);
        onCodeChange(newCode);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onCmdEnter();
      }
    },
    [code, readOnly, onCodeChange, onCmdEnter]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
        {header}
        <EditorBody code={code} onCodeChange={onCodeChange} onKeyDown={handleKeyDown} readOnly={readOnly} />
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

// ─── Algorithm page editor ───────────────────────────────────────────────────
// Read-only code view with Sort/Pause/Step/Resume/Stop/Reset in header

import { EngineState } from "@/hooks/use-sort-engine";

type AlgorithmEditorProps = {
  code: string;
  state: EngineState;
  operationCount: number;
  onSort: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
};

export function AlgorithmEditor({
  code,
  state,
  operationCount,
  onSort,
  onPause,
  onResume,
  onStep,
  onReset,
}: AlgorithmEditorProps) {
  const isIdle = state === "idle";
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isComplete = state === "complete";

  const header = (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-surface-2/50">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-accent shadow-[0_0_6px_var(--accent-glow)] animate-pulse" : isComplete ? "bg-sorted" : "bg-accent shadow-[0_0_4px_var(--accent-glow)]"}`} />
        <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">Code</span>
      </div>
      <div className="flex items-center gap-1.5">
        {isIdle && <TransportBtn onClick={onSort} variant="accent">Sort</TransportBtn>}
        {isRunning && (
          <>
            <TransportBtn onClick={onPause}>Pause</TransportBtn>
            <TransportBtn onClick={onReset} variant="danger">Stop</TransportBtn>
          </>
        )}
        {isPaused && (
          <>
            <TransportBtn onClick={onResume} variant="accent">Resume</TransportBtn>
            <TransportBtn onClick={onStep}>Step</TransportBtn>
            <TransportBtn onClick={onReset}>Reset</TransportBtn>
          </>
        )}
        {isComplete && <TransportBtn onClick={onReset}>Reset</TransportBtn>}
      </div>
    </div>
  );

  return (
    <EditorShell
      code={code}
      onCodeChange={() => {}}
      onCmdEnter={onSort}
      readOnly
      error={null}
      header={header}
    />
  );
}

// ─── Playground editor ───────────────────────────────────────────────────────
// Editable code, Run/Stop/Reset, load example buttons in header

import { algorithms, getAlgorithm } from "@/algorithms/metadata";

type PlaygroundEditorProps = {
  initialCode?: string;
  error: string | null;
  state: "idle" | "running" | "paused" | "complete";
  operationCount: number;
  onRun: (code: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStep?: () => void;
  onStop: () => void;
};

export function PlaygroundEditor({
  initialCode,
  error,
  state,
  operationCount,
  onRun,
  onPause,
  onResume,
  onStep,
  onStop,
}: PlaygroundEditorProps) {
  const [code, setCode] = useState(initialCode ?? DEFAULT_CODE);
  const codeRef = useRef(code);

  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
      codeRef.current = initialCode;
    }
  }, [initialCode]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    codeRef.current = newCode;
  }, []);

  const handleRun = useCallback(() => {
    onRun(codeRef.current);
  }, [onRun]);

  const handleLoad = useCallback((slug: string) => {
    const algo = getAlgorithm(slug);
    if (algo) {
      setCode(algo.code);
      codeRef.current = algo.code;
    }
  }, []);

  const isIdle = state === "idle";
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isComplete = state === "complete";
  const disabled = isRunning || isPaused;

  const header = (
    <div className="flex flex-col border-b border-border/60 bg-surface-2/50">
      {/* Row 1: load example buttons */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto border-b border-border/30">
        <span className="text-[10px] font-mono text-foreground-muted/50 tracking-widest uppercase shrink-0">Load:</span>
        {algorithms.map((algo) => (
          <button
            key={algo.slug}
            onClick={() => handleLoad(algo.slug)}
            disabled={disabled}
            className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border border-border bg-surface-2 text-foreground-muted hover:text-accent hover:border-accent/30 transition-all disabled:opacity-30 shrink-0 whitespace-nowrap"
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Row 2: transport controls */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-accent shadow-[0_0_6px_var(--accent-glow)] animate-pulse" : isComplete ? "bg-sorted" : "bg-accent shadow-[0_0_4px_var(--accent-glow)]"}`} />
          <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">Editor</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-foreground-muted/40 tabular-nums mr-1">
            {operationCount.toLocaleString()} ops
          </span>
          {isIdle && <TransportBtn onClick={handleRun} variant="accent">Run</TransportBtn>}
          {isRunning && (
            <>
              {onPause && <TransportBtn onClick={onPause}>Pause</TransportBtn>}
              <TransportBtn onClick={onStop} variant="danger">Stop</TransportBtn>
            </>
          )}
          {isPaused && (
            <>
              {onResume && <TransportBtn onClick={onResume} variant="accent">Resume</TransportBtn>}
              {onStep && <TransportBtn onClick={onStep}>Step</TransportBtn>}
              <TransportBtn onClick={onStop}>Reset</TransportBtn>
            </>
          )}
          {isComplete && <TransportBtn onClick={onStop}>Reset</TransportBtn>}
        </div>
      </div>
    </div>
  );

  return (
    <EditorShell
      code={code}
      onCodeChange={handleCodeChange}
      onCmdEnter={handleRun}
      error={error}
      header={header}
    />
  );
}

export { DEFAULT_CODE };
