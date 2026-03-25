# SortSonic

**[sortsonic.kylejeffrey.com](https://sortsonic.kylejeffrey.com)**

An interactive, browser-based visualizer that brings sorting algorithms to life through synchronized audio and animation. Every comparison, swap, and insertion is mapped to a distinct tone — so you don't just see the algorithm work, you hear it think.

## Features

- **9 sorting algorithms** — Bubble, Selection, Insertion, Merge, Quick, Heap, Cocktail, Bogo, and Stalin Sort
- **Audio synthesis** — Web Audio API generates tones mapped to array values in real time
- **Write your own** — code editor with syntax highlighting, `compare()`/`swap()` API, Web Worker sandbox
- **Victory sweep** — color wave animation with ascending tones on sort completion
- **Per-algorithm pages** with complexity analysis, code view, and SEO metadata

## Tech Stack

- Next.js 16 (App Router, React Compiler)
- TypeScript
- Tailwind CSS v4
- Web Audio API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

**Sorting engine:** Each built-in algorithm is a generator function that `yield`s after every operation. A playback loop calls `.next()` on a timer, updating the visualizer and triggering audio per step.

**User code:** Custom algorithms run in a Web Worker sandbox. The worker provides `compare(i, j)`, `swap(i, j)`, `get(i)`, `set(i, value)`, and `length`. Operations are collected synchronously, then replayed with animation and sound.

**Audio:** A single `AudioContext` spawns short-lived `OscillatorNode`s per operation. Frequency maps linearly from array value (200–800 Hz). Gain envelopes prevent clicks.
