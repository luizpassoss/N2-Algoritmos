import type { SearchStrategy, SearchOptions } from "../domain/SearchStrategy.js";
import { buildSearchResult, type SearchResult } from "../domain/SearchResult.js";
import { StepRecorder } from "./StepRecorder.js";

export class KMPSearch implements SearchStrategy {
  readonly name = "kmp";
  readonly complexity = "O(n+m)";

  static buildLPS(pattern: string): number[] {
    const m = pattern.length;
    const lps = new Array<number>(m).fill(0);
    let len = 0;
    let i = 1;
    while (i < m) {
      if (pattern[i] === pattern[len]) {
        lps[i++] = ++len;
      } else if (len > 0) {
        len = lps[len - 1];
      } else {
        lps[i++] = 0;
      }
    }
    return lps;
  }

  search(text: string, pattern: string, options: SearchOptions = {}): SearchResult {
    const start = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    const rec = new StepRecorder(!!options.recordSteps, options.maxSteps);
    let comparisons = 0;

    const lps = m > 0 ? KMPSearch.buildLPS(pattern) : [];

    if (m > 0 && m <= n) {
      let i = 0;
      let j = 0;
      while (i < n) {
        comparisons++;
        const ok = text[i] === pattern[j];
        rec.add({
          shift: i - j,
          textIndex: i,
          patternIndex: j,
          match: ok,
          note: ok
            ? `'${pattern[j]}' casa (i=${i}, j=${j})`
            : j > 0
              ? `falha → usa LPS: j vai de ${j} para ${lps[j - 1]}`
              : `falha em j=0 → avança i`,
        });

        if (ok) {
          i++;
          j++;
          if (j === m) {
            matches.push(i - j);
            j = lps[j - 1];
          }
        } else if (j > 0) {
          j = lps[j - 1];
        } else {
          i++;
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
      aux: { lps },
    });
  }
}
