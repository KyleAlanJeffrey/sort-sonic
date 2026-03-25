import { Metadata } from "next";
import { PlaygroundWrapper } from "@/components/playground-wrapper";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Write your own sorting algorithm and watch it visualize in real time with synchronized audio. Supports compare, swap, get, and set operations.",
  openGraph: {
    title: "Sorting Playground — SortSonic",
    description:
      "Write your own sorting algorithm and visualize it with sound.",
  },
};

export default function PlaygroundPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="text-foreground-muted mt-1">
          Write your own sorting algorithm and watch it come to life with
          synchronized audio and animation.
        </p>
      </div>

      <PlaygroundWrapper />
    </div>
  );
}
