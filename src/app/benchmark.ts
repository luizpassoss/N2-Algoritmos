import { SearchContext } from "../context/SearchContext.js";
import { listStrategies } from "../strategies/index.js";
import type { SearchResult } from "../domain/SearchResult.js";
import { log } from "../telemetry/logger.js";

export interface BenchmarkOptions {
  repetitions: number;
}

export interface AlgorithmStats {
  algorithm: string;
  complexity: string;
  matches: number;
  comparisons: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
}

export function runBenchmark(
  text: string,
  pattern: string,
  options: BenchmarkOptions,
): AlgorithmStats[] {
  const stats: AlgorithmStats[] = [];

  for (const strategy of listStrategies()) {
    const context = new SearchContext(strategy);
    const durations: number[] = [];
    let last: SearchResult | null = null;

    for (let r = 0; r < options.repetitions; r++) {
      const result = context.execute(text, pattern, { recordSteps: false });
      durations.push(result.durationMs);
      last = result;
    }

    stats.push({
      algorithm: strategy.name,
      complexity: strategy.complexity,
      matches: last!.matches.length,
      comparisons: last!.comparisons,
      avgDurationMs: avg(durations),
      minDurationMs: Math.min(...durations),
      maxDurationMs: Math.max(...durations),
    });
  }

  log.info("Benchmark concluído", {
    textLength: text.length,
    pattern,
    repetitions: options.repetitions,
  });
  return stats;
}

function avg(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function printStats(
  stats: AlgorithmStats[],
  textLength: number,
  pattern: string,
): void {
  console.log(
    `\n=== Resultados (n=${textLength.toLocaleString("pt-BR")} chars, ` +
      `padrão="${pattern}" m=${pattern.length}) ===`,
  );
  console.table(
    stats.map((s) => ({
      algoritmo: s.algorithm,
      complexidade: s.complexity,
      ocorrencias: s.matches,
      comparacoes: s.comparisons,
      "tempo_med_ms": s.avgDurationMs.toFixed(5),
      "tempo_min_ms": s.minDurationMs.toFixed(5),
    })),
  );
}
