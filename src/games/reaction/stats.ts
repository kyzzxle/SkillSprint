export interface ReactionSummary {
  average: number;
  fastest: number;
  slowest: number;
  median: number;
}

export function summarize(times: number[]): ReactionSummary {
  if (!times.length) return { average: 0, fastest: 0, slowest: 0, median: 0 };
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    fastest: sorted[0],
    slowest: sorted[sorted.length - 1],
    median: sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
  };
}

/** Random wait before the signal: 1.5 s – 5 s. */
export function randomDelay(rng: () => number = Math.random): number {
  return 1500 + rng() * 3500;
}
