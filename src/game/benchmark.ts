import benchmarkData from "./benchmark-data.json";

interface BenchmarkSummary {
  games: number;
  average: number;
  min: number;
  median: number;
  p90: number;
  max: number;
}

interface BenchmarkPayload {
  gamesPerStrategy: number;
  baseSeed: number;
  strategyNames: string[];
  combinedScores: number[];
  summaries: Record<string, BenchmarkSummary>;
}

const payload = benchmarkData as BenchmarkPayload;

export const BENCHMARK_SAMPLE_SIZE = payload.combinedScores.length;
export const BENCHMARK_STRATEGIES = payload.strategyNames;
export const BENCHMARK_SUMMARIES = payload.summaries;

export function percentileForScore(score: number): number {
  const scores = payload.combinedScores;
  let left = 0;
  let right = scores.length;

  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (scores[middle] <= score) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }

  return Math.round((left / scores.length) * 100);
}

export function benchmarkTierLabel(percentile: number): string {
  if (percentile >= 95) {
    return "传奇调香师";
  }
  if (percentile >= 80) {
    return "高段调香师";
  }
  if (percentile >= 60) {
    return "成熟调香师";
  }
  if (percentile >= 40) {
    return "稳定调香师";
  }
  if (percentile >= 20) {
    return "见习调香师";
  }
  return "初学调香师";
}
