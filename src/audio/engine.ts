import { OperationType } from "@/algorithms/types";

const MIN_FREQ = 200;
const MAX_FREQ = 800;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function mapValueToFreq(value: number, maxValue: number): number {
  return MIN_FREQ + (value / maxValue) * (MAX_FREQ - MIN_FREQ);
}

export function playTone(
  value: number,
  maxValue: number,
  type: OperationType,
  duration: number = 50
) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const freq = mapValueToFreq(value, maxValue);

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, now);

  // Volume based on operation type
  const volume = type === "swap" ? 0.15 : type === "sorted" ? 0.2 : 0.08;
  const durationSec = duration / 1000;

  // Envelope to avoid clicks
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  oscillator.start(now);
  oscillator.stop(now + durationSec);
}

export function playDualTone(
  value1: number,
  value2: number,
  maxValue: number,
  duration: number = 50
) {
  playTone(value1, maxValue, "swap", duration);
  playTone(value2, maxValue, "swap", duration);
}

export function playCompletionSweep(arraySize: number, maxValue: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < arraySize; i++) {
    const freq = MIN_FREQ + (i / arraySize) * (MAX_FREQ - MIN_FREQ);
    const time = now + i * 0.02;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.start(time);
    osc.stop(time + 0.03);
  }
}
