import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { startTelemetry, shutdownTelemetry } from "../telemetry/telemetry.js";
import { DataLoader } from "../data/DataLoader.js";
import { SearchContext } from "../context/SearchContext.js";
import { getStrategy, listStrategies } from "../strategies/index.js";
import { runBenchmark, printStats } from "./benchmark.js";
import { log } from "../telemetry/logger.js";

interface CliArgs {
  mode: "demo" | "benchmark" | "single";
  file: string;
  pattern: string;
  algo?: string;
  steps: boolean;
  repetitions: number;
  loop: number;
}

function parseArgs(argv: string[]): CliArgs {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const mode: CliArgs["mode"] = argv.includes("--demo")
    ? "demo"
    : argv.includes("--algo")
      ? "single"
      : "benchmark";

  return {
    mode,
    file: get("--file") ?? resolve(process.cwd(), "data/texto_1024kb.txt"),
    pattern: get("--pattern") ?? "algoritmo",
    algo: get("--algo"),
    steps: argv.includes("--steps"),
    repetitions: get("--repetitions") ? Number(get("--repetitions")) : 50,
    loop: get("--loop") ? Number(get("--loop")) : 1,
  };
}

async function main(): Promise<void> {
  startTelemetry();
  const args = parseArgs(process.argv.slice(2));
  try {
    if (args.mode === "demo") runDemo();
    else if (args.mode === "single") runSingle(args);
    else runBench(args);
  } finally {
    await new Promise((r) => setTimeout(r, 1500));
    await shutdownTelemetry();
  }
}

function loadText(file: string): string {
  if (existsSync(file)) {
    log.info("Carregando texto de arquivo", { file });
    return DataLoader.fromFile(file);
  }
  log.warn("Arquivo não encontrado — usando texto sintético (~256KB)", { file });
  return DataLoader.synthetic(256);
}

function runDemo(): void {
  const text = "abracadabra abracadabra algoritmo de busca em string algoritmo";
  const pattern = "algoritmo";
  console.log(`\nDEMO — buscando "${pattern}" em ${text.length} caracteres\n`);
  for (const strategy of listStrategies()) {
    const r = new SearchContext(strategy).execute(text, pattern);
    console.log(
      `  ${strategy.name.padEnd(12)} ocorrencias=[${r.matches.join(", ")}] ` +
        `comparacoes=${r.comparisons} tempo=${r.durationMs.toFixed(5)}ms`,
    );
  }
}

function runSingle(args: CliArgs): void {
  const text = loadText(args.file);
  const ctx = new SearchContext(getStrategy(args.algo!));
  const r = ctx.execute(text, args.pattern, { recordSteps: args.steps, maxSteps: 80 });

  console.log(`\nAlgoritmo: ${r.algorithm} | complexidade ${r.theoreticalComplexity}`);
  console.log(`Texto: ${r.textLength} chars | padrão "${r.pattern}" (m=${r.patternLength})`);
  console.log(`Ocorrências (${r.matches.length}): ${r.matches.slice(0, 20).join(", ")}${r.matches.length > 20 ? " ..." : ""}`);
  console.log(`Comparações: ${r.comparisons} | tempo: ${r.durationMs.toFixed(5)} ms`);
  if (Object.keys(r.aux).length) console.log("Estruturas auxiliares:", r.aux);

  if (args.steps) {
    console.log(`\n--- Passo a passo (primeiros ${r.steps.length}) ---`);
    r.steps.forEach((s, i) =>
      console.log(
        `${String(i + 1).padStart(3)}. shift=${s.shift} t[${s.textIndex}] p[${s.patternIndex}] ` +
          `${s.match ? "[match]" : "[x]"} ${s.note}`,
      ),
    );
  }
}

function runBench(args: CliArgs): void {
  const text = loadText(args.file);
  for (let i = 0; i < args.loop; i++) {
    if (args.loop > 1) console.log(`\n--- rodada ${i + 1}/${args.loop} ---`);
    const stats = runBenchmark(text, args.pattern, { repetitions: args.repetitions });
    printStats(stats, text.length, args.pattern);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exitCode = 1;
});
