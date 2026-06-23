import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import {
  SemanticResourceAttributes,
} from "@opentelemetry/semantic-conventions";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";
import {
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-node";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
} from "@opentelemetry/sdk-logs";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { logs } from "@opentelemetry/api-logs";

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? "search-observability";
const OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";
const OTEL_ENABLED = (process.env.OTEL_ENABLED ?? "true").toLowerCase() === "true";

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    process.env.NODE_ENV ?? "development",
});

let sdk: NodeSDK | null = null;
let loggerProvider: LoggerProvider | null = null;

export function startTelemetry(): void {
  const traceExporter = OTEL_ENABLED
    ? new OTLPTraceExporter({ url: `${OTLP_ENDPOINT}/v1/traces` })
    : new ConsoleSpanExporter();

  const spanProcessor = OTEL_ENABLED
    ? new BatchSpanProcessor(traceExporter)
    : new SimpleSpanProcessor(traceExporter);

  const metricReader = new PeriodicExportingMetricReader({
    exporter: OTEL_ENABLED
      ? new OTLPMetricExporter({ url: `${OTLP_ENDPOINT}/v1/metrics` })
      : new ConsoleMetricExporter(),
    exportIntervalMillis: 5000,
  });

  loggerProvider = new LoggerProvider({ resource });
  const logExporter = OTEL_ENABLED
    ? new OTLPLogExporter({ url: `${OTLP_ENDPOINT}/v1/logs` })
    : new ConsoleLogRecordExporter();
  loggerProvider.addLogRecordProcessor(
    OTEL_ENABLED
      ? new BatchLogRecordProcessor(logExporter)
      : new SimpleLogRecordProcessor(logExporter),
  );
  logs.setGlobalLoggerProvider(loggerProvider);

  sdk = new NodeSDK({ resource, spanProcessor, metricReader });
  sdk.start();

  console.error(
    `[telemetry] iniciada | service=${SERVICE_NAME} | otel=${OTEL_ENABLED ? `OTLP ${OTLP_ENDPOINT}` : "console"}`,
  );
}

export async function shutdownTelemetry(): Promise<void> {
  try {
    await loggerProvider?.forceFlush();
    await loggerProvider?.shutdown();
  } catch {
    /* noop */
  }
  try {
    await sdk?.shutdown();
  } catch {
    /* noop */
  }
}

export { SERVICE_NAME };
