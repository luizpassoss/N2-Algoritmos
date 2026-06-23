import type { SearchStrategy, SearchOptions } from "../domain/SearchStrategy.js";
import { buildSearchResult, type SearchResult } from "../domain/SearchResult.js";
import { StepRecorder } from "./StepRecorder.js";

export class BoyerMooreSearch implements SearchStrategy {
  readonly name = "boyer-moore";
  readonly complexity = "O(n/m) melhor";

  static buildBadChar(pattern: string): Record<string, number> {
    const table: Record<string, number> = {};
    for (let i = 0; i < pattern.length; i++) table[pattern[i]] = i;
    return table;
  }

  search(text: string, pattern: string, options: SearchOptions = {}): SearchResult {
    const start = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    const rec = new StepRecorder(!!options.recordSteps, options.maxSteps);
    let comparisons = 0;

    const badChar = m > 0 ? BoyerMooreSearch.buildBadChar(pattern) : {};

    if (m > 0 && m <= n) {
      let s = 0;
      while (s <= n - m) {
        let j = m - 1;
        while (j >= 0) {
          comparisons++;
          const ok = text[s + j] === pattern[j];
          rec.add({
            shift: s,
            textIndex: s + j,
            patternIndex: j,
            match: ok,
            note: ok
              ? `'${pattern[j]}' casa (da direita p/ esquerda) em texto[${s + j}]`
              : `'${text[s + j]}' ≠ '${pattern[j]}' → salto pela tabela bad-char`,
          });
          if (!ok) break;
          j--;
        }

        if (j < 0) {
          matches.push(s);
          const next = s + m < n ? m - (badChar[text[s + m]] ?? -1) : 1;
          s += Math.max(1, next);
        } else {
          const lastOcc = badChar[text[s + j]] ?? -1;
          s += Math.max(1, j - lastOcc);
        }
      }
    }

    return buildSearchResult({
      algorithm: this.name,
      pattern,
      textLength: n,
      matches,
      comparisons,
      durationMs: performance.now() - start,
      theoreticalComplexity: this.complexity,
      steps: rec.getSteps(),
      aux: { badChar },
    });
  }
}
