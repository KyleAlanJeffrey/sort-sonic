# SortSonic — Implementation Plan

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Audio:** Web Audio API (no libraries)
- **State:** React hooks + useRef for mutable animation state

---

## Audio: How It Works

We use the **Web Audio API** directly — no audio files, no libraries.

### Tone Generation

1. Create a single `AudioContext` on first user interaction (browsers require a user gesture to start audio).
2. For each sorting operation, spawn a short-lived `OscillatorNode`:
   - **Frequency** is mapped from the array value. E.g., value `1` maps to ~200 Hz, value `100` maps to ~800 Hz. Linear interpolation between min/max gives each bar a unique pitch.
   - **Waveform** is `sine` by default (clean tone), with options for `triangle` or `square` for different sonic textures.
   - **Duration** is tied to the current speed setting (~30–150 ms per operation).
3. A `GainNode` applies a short envelope (attack + decay) to avoid clicks/pops between tones.
4. Different operation types get subtle audio cues:
   - **Compare:** soft tone at the value's pitch
   - **Swap:** slightly louder, dual-tone (both values)
   - **Sorted/final position:** brief ascending chirp

### Why This Approach

- Zero bundle size for audio — it's all browser-native
- Precise timing control synced to animation frames
- No latency from decoding audio files

---

## Code Execution: How Sorting Algorithms Run

Users don't write arbitrary code — they **select from built-in algorithms** and watch them execute. The key challenge is making an O(n log n) algorithm run *slowly and visibly*.

### Generator-Based Execution Model

Each sorting algorithm is implemented as a **JavaScript generator function** (`function*`). Instead of running to completion, it `yield`s after every meaningful operation:

```ts
type SortOperation = {
  type: "compare" | "swap" | "insert" | "sorted";
  indices: number[];    // which bars are involved
  values?: number[];    // current values at those indices
};

function* bubbleSort(arr: number[]): Generator<SortOperation> {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      yield { type: "compare", indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield { type: "swap", indices: [j, j + 1], values: [arr[j], arr[j + 1]] };
      }
    }
    yield { type: "sorted", indices: [arr.length - i - 1] };
  }
}
```

### Playback Loop

An animation controller drives the visualization:

1. Call `generator.next()` to get the next `SortOperation`
2. Update bar heights/colors in state to reflect the operation
3. Trigger the corresponding audio tone
4. Wait for the configured delay (`requestAnimationFrame` + a timeout tied to speed slider)
5. Repeat until `generator.done === true`

### Why Generators

- **Pausable:** calling `.next()` is explicit — trivial to pause/resume/step
- **Speed control:** just change the delay between `.next()` calls
- **No web workers needed:** generators don't block the main thread since each step is microseconds of work
- **Step-by-step mode:** call `.next()` once per button click for manual stepping

### User-Written Code (Core Feature)

Users can write their own sorting algorithms in a built-in code editor:

1. **Editor:** Monaco Editor (same engine as VS Code) embedded in the page. Pre-filled with a template:
   ```js
   function sort(arr) {
     // Write your sorting algorithm here.
     // Use compare(i, j) instead of arr[i] > arr[j]
     // Use swap(i, j) instead of manual swapping
     // These helpers trigger the visualization + audio.
   }
   ```
2. **Instrumented API:** Instead of raw array access, we provide `compare(i, j)` and `swap(i, j)` helper functions. These:
   - Perform the actual array operation
   - Record a `SortOperation` event
   - Suspend execution until the animation/audio for that step completes
3. **Execution via async/await:** The user's function runs inside an `async` wrapper. `compare()` and `swap()` return promises that resolve after the configured delay. This pauses the user's code naturally at each operation — no generators or AST transforms needed from the user's perspective.
   ```ts
   // What runs under the hood:
   const compare = async (i: number, j: number): Promise<boolean> => {
     emit({ type: "compare", indices: [i, j] });
     await delay(speed);
     return arr[i] > arr[j];
   };
   const swap = async (i: number, j: number): Promise<void> => {
     [arr[i], arr[j]] = [arr[j], arr[i]];
     emit({ type: "swap", indices: [i, j], values: [arr[i], arr[j]] });
     await delay(speed);
   };
   ```
4. **Sandboxing:** User code runs in a Web Worker with:
   - A **timeout** (e.g. 30s) that terminates the worker if the sort doesn't complete
   - No access to DOM, network, or storage
   - Communication via `postMessage` to send operations back to the main thread for rendering + audio
5. **Error handling:** Syntax errors and runtime exceptions are caught and displayed inline below the editor with line/column info.

### Built-in vs. Custom

- **Built-in algorithms** use the generator approach (synchronous, precise control)
- **User-written code** uses the async/worker approach (safer, simpler API for users)
- Both feed into the same `SortOperation` pipeline, so visualization and audio are identical

---

## SEO Strategy

Next.js App Router gives us server-side rendering by default — the key is making sure we use it well.

### Metadata & Open Graph

- Rich metadata in `layout.tsx` via the Next.js `metadata` export:
  - Title: "SortSonic — See and Hear Sorting Algorithms"
  - Description targeting search terms: "sorting algorithm visualizer", "bubble sort animation", "sorting with sound"
  - Open Graph image: a static screenshot of the visualizer mid-sort (stored in `/public/og.png`)
  - Twitter card metadata
  - `robots.txt` and `sitemap.xml` generated via Next.js route handlers

### Per-Algorithm Pages (SSR)

Instead of a single SPA page, each algorithm gets its own route:

```
/                         — landing page, hero + algorithm grid
/algorithms/bubble-sort   — bubble sort visualizer + explanation
/algorithms/merge-sort    — merge sort visualizer + explanation
/algorithms/quick-sort    — etc.
/playground               — custom code editor mode
```

Each algorithm page includes:
- **Server-rendered text content:** algorithm name, time/space complexity, how-it-works explanation, pseudocode — all indexable by crawlers
- **Unique metadata:** `<title>Bubble Sort Visualizer — SortSonic</title>`, unique descriptions per page
- **Structured data** (`JSON-LD`): `SoftwareApplication` + `HowTo` schema so Google can show rich results
- The interactive visualizer loads client-side on top of the static content

### Why This Helps

- Crawlers see real HTML content, not a blank `<div id="root">`
- Each algorithm page targets long-tail keywords ("merge sort visualization with sound", "quick sort step by step")
- Shareable URLs — linking someone to `/algorithms/quick-sort` is better than a query param
- OG images make social shares look good

### Updated Project Structure (routes)

```
src/app/
  layout.tsx                        — root layout, global metadata, fonts
  page.tsx                          — landing/hero page
  algorithms/
    [slug]/
      page.tsx                      — dynamic route for each algorithm
  playground/
    page.tsx                        — custom code editor
  sitemap.ts                        — auto-generated sitemap
  robots.ts                         — robots.txt config
```

---

## Project Structure

```
src/
  app/
    layout.tsx              — root layout, global metadata, fonts
    page.tsx                — landing page / hero + algorithm grid
    globals.css             — tailwind base + custom properties
    sitemap.ts              — auto-generated sitemap
    robots.ts               — robots.txt config
    algorithms/
      [slug]/
        page.tsx            — per-algorithm page (SSR content + visualizer)
    playground/
      page.tsx              — custom code editor mode

  components/
    visualizer.tsx      — the bar chart canvas (renders array state)
    controls.tsx        — play/pause/reset, speed slider, size slider
    algorithm-picker.tsx — dropdown or tabs to select algorithm, or "Custom"
    code-editor.tsx     — Monaco editor wrapper for user-written sorts
    step-info.tsx       — shows current operation ("Comparing i=3, j=7")
    error-display.tsx   — inline error display for user code

  algorithms/
    types.ts            — SortOperation type, generator type alias
    bubble-sort.ts      — generator implementation
    selection-sort.ts
    insertion-sort.ts
    merge-sort.ts
    quick-sort.ts
    heap-sort.ts
    metadata.ts         — per-algorithm name, description, complexity, slug, explanation text

  audio/
    engine.ts           — AudioContext setup, playTone(), mapValueToFreq()

  workers/
    sort-worker.ts      — Web Worker that runs user-written code in a sandbox

  hooks/
    useSortEngine.ts    — orchestrates generator + animation loop + audio
    useUserCode.ts      — manages Monaco state, worker lifecycle, error display
```

---

## Build Order

### Phase 1 — Skeleton & SEO Foundation
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up root layout with global metadata, OG image, JSON-LD structured data
3. Create route structure (`/`, `/algorithms/[slug]`, `/playground`)
4. Generate `sitemap.ts` and `robots.ts`
5. Build the `Visualizer` component (static array of bars)
6. Wire up array size slider to regenerate random arrays

### Phase 2 — Sorting Engine
7. Implement `bubbleSort` generator + `SortOperation` types
8. Build `useSortEngine` hook — drives `.next()` on a timer, updates state
9. Connect visualizer to engine — bars animate on sort operations

### Phase 3 — Audio
10. Build `audio/engine.ts` — `AudioContext`, `playTone(value, type)`
11. Hook audio into the sort engine — each yielded operation triggers a tone

### Phase 4 — User Code Editor
12. Integrate Monaco Editor component
13. Build Web Worker sandbox (`sort-worker.ts`)
14. Wire `compare()`/`swap()` async API to operation pipeline
15. Error handling + display
16. Template code + example snippets

### Phase 5 — Polish & Algorithms
17. Add remaining built-in algorithms (selection, insertion, merge, quick, heap)
18. Algorithm picker component (built-in list + "Custom" option)
19. Per-algorithm pages with SSR content (explanation, complexity, pseudocode)
20. Speed/size controls
21. Step info display
22. Color coding (comparing = yellow, swapping = red, sorted = green)

### Phase 6 — UX
23. Responsive layout
24. Dark/light theme
25. Step-through mode (manual `.next()`)
26. Operation counter + time elapsed display
