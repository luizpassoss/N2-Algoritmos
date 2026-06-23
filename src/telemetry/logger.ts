import { logs, SeverityNumber } from "@opentelemetry/api-logs";

const otelLogger = logs.getLogger("search-observability", "1.0.0");

type Attrs = Record<string, string | number | boolean>;

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  body: string,
  attributes?: Attrs,
): void {
  otelLogger.emit({ severityNumber, severityText, body, attributes });
  console.error(`[${severityText}] ${body}`, attributes ?? "");
}

export const log = {
  info: (body: string, attributes?: Attrs) =>
    emit(SeverityNumber.INFO, "INFO", body, attributes),
  warn: (body: string, attributes?: Attrs) =>
    emit(SeverityNumber.WARN, "WARN", body, attributes),
  error: (body: string, attributes?: Attrs) =>
    emit(SeverityNumber.ERROR, "ERROR", body, attributes),
  debug: (body: string, attributes?: Attrs) =>
    emit(SeverityNumber.DEBUG, "DEBUG", body, attributes),
};
