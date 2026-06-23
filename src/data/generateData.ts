import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_SIZES_KB = [64, 1024, 5120];
const PATTERN = "algoritmo";
const WORDS = [
  "busca", "texto", "padrao", "string", "dados", "analise", "tempo",
  "complexidade", "naive", "hash", "prefixo", "sufixo", "tabela", "salto",
  "comparacao", "indice", "janela", "caractere", "memoria", "processo",
];

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generate(sizeKB: number, outDir: string): { path: string; bytes: number } {
  const targetBytes = sizeKB * 1024;
  const parts: string[] = [];
  let bytes = 0;
  let counter = 0;
  while (bytes < targetBytes) {
    const word = counter % 200 === 0 ? PATTERN : randomWord();
    parts.push(word);
    bytes += word.length + 1;
    counter++;
  }
  const content = parts.join(" ");
  const path = resolve(outDir, `texto_${sizeKB}kb.txt`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return { path, bytes: content.length };
}

function main(): void {
  const args = process.argv.slice(2).map(Number).filter((n) => n > 0);
  const sizes = args.length > 0 ? args : DEFAULT_SIZES_KB;
  const outDir = resolve(process.cwd(), "data");

  console.log(`Gerando ${sizes.length} arquivo(s) de texto em ${outDir} ...`);
  console.log(`Padrão injetado para testes: "${PATTERN}"`);
  for (const kb of sizes) {
    const { path, bytes } = generate(kb, outDir);
    console.log(`  ✔ ~${kb}KB (${bytes.toLocaleString("pt-BR")} chars) -> ${path}`);
  }
  console.log("Concluído.");
}

main();
