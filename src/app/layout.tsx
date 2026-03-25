import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { KyleBadge } from "@kylealanjeffrey/badge";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
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
      className={`${outfit.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <KyleBadge />
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
