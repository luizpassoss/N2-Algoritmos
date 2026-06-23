import { trace, SpanStatusCode, type Tracer } from "@opentelemetry/api";
import type { SearchStrategy, SearchOptions } from "../domain/SearchStrategy.js";
import type { SearchResult } from "../domain/SearchResult.js";
import {
  executionsCounter,
  durationHistogram,
  comparisonsHistogram,
} from "../telemetry/metrics.js";
import { log } from "../telemetry/logger.js";

export class SearchContext {
  private strategy: SearchStrategy;
  private readonly tracer: Tracer = trace.getTracer("search-observability", "1.0.0");

  constructor(strategy: SearchStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SearchStrategy): void {
    this.strategy = strategy;
  }

  getStrategy(): SearchStrategy {
    return this.strategy;
  }

  execute(text: string, pattern: string, options: SearchOptions = {}): SearchResult {
    const algorithm = this.strategy.name;

    return this.tracer.startActiveSpan(`search.${algorithm}`, (span) => {
      try {
        span.setAttributes({
          "search.algorithm": algorithm,
          "search.complexity": this.strategy.complexity,
          "search.text_length": text.length,
          "search.pattern_length": pattern.length,
        });

        log.info("Iniciando busca de padrão", {
          algorithm,
          textLength: text.length,
          patternLength: pattern.length,
        });

        const result = this.strategy.search(text, pattern, options);

        const attrs = { algorithm };
        executionsCounter.add(1, attrs);
        durationHistogram.record(result.durationMs, attrs);
        comparisonsHistogram.record(result.comparisons, attrs);

        span.setAttributes({
          "search.matches": result.matches.length,
          "search.comparisons": result.comparisons,
          "search.duration_ms": result.durationMs,
        });

        log.info("Busca concluída", {
          algorithm,
          matches: result.matches.length,
          comparisons: result.comparisons,
          durationMs: Number(result.durationMs.toFixed(4)),
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        span.recordException(err as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message });
        log.error("Falha na busca", { algorithm, error: message });
        throw err;
      } finally {
        span.end();
      }
    });
  }
}
