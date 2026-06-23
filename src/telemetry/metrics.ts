import { metrics, type Counter, type Histogram } from "@opentelemetry/api";

const meter = metrics.getMeter("search-observability", "1.0.0");

export const executionsCounter: Counter = meter.createCounter(
  "search_executions_total",
  { description: "Número total de execuções de busca", unit: "1" },
);

export const durationHistogram: Histogram = meter.createHistogram(
  "search_duration_ms",
  { description: "Tempo de execução das buscas em milissegundos", unit: "ms" },
);

export const comparisonsHistogram: Histogram = meter.createHistogram(
  "search_comparisons",
  { description: "Número de comparações realizadas por busca", unit: "1" },
);
