import { readFileSync, existsSync } from "node:fs";

export class DataLoader {
  static fromFile(path: string): string {
    if (!existsSync(path)) {
      throw new Error(
        `Arquivo não encontrado: ${path}. Gere os dados com "npm run gen:data".`,
      );
    }
    return readFileSync(path, "utf8");
  }

  static synthetic(sizeKB: number, pattern = "algoritmo"): string {
    const words = ["busca", "texto", "padrao", "dados", "analise", "tempo", "hash"];
    const parts: string[] = [];
    let bytes = 0;
    let i = 0;
    const target = sizeKB * 1024;
    while (bytes < target) {
      const w = i % 200 === 0 ? pattern : words[i % words.length];
      parts.push(w);
      bytes += w.length + 1;
      i++;
    }
    return parts.join(" ");
  }
}
