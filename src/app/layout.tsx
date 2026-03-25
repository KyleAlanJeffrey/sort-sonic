import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "SortSonic — See and Hear Sorting Algorithms",
    template: "%s — SortSonic",
  },
  description:
    "Interactive sorting algorithm visualizer with synchronized audio. Watch and hear Bubble Sort, Merge Sort, Quick Sort, and more. Write your own sorting algorithms and see them come to life.",
  keywords: [
    "sorting algorithm visualizer",
    "sorting with sound",
    "bubble sort animation",
    "merge sort visualization",
    "quick sort visualizer",
    "algorithm visualization",
    "sorting algorithm comparison",
    "interactive sorting",
    "computer science education",
  ],
  openGraph: {
    title: "SortSonic — See and Hear Sorting Algorithms",
    description:
      "Interactive sorting algorithm visualizer with synchronized audio and animation.",
    type: "website",
    siteName: "SortSonic",
  },
  twitter: {
    card: "summary_large_image",
    title: "SortSonic — See and Hear Sorting Algorithms",
    description:
      "Interactive sorting algorithm visualizer with synchronized audio and animation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <header className="border-b border-border/50 px-6 py-5 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <nav className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)] group-hover:shadow-[0_0_14px_var(--accent)] transition-shadow" />
              <span className="text-lg font-bold tracking-wide uppercase">
                Sort<span className="text-accent">Sonic</span>
              </span>
            </Link>
            <div className="flex gap-6 text-sm font-mono text-foreground-muted tracking-wider uppercase">
              <Link
                href="/"
                className="hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/playground"
                className="hover:text-accent transition-colors duration-200"
              >
                Playground
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-border/30 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted tracking-wider uppercase">
              SortSonic
            </span>
            <span className="text-xs font-mono text-foreground-muted/50">
              Where algorithms find their rhythm
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
