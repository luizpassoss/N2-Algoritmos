import type { SearchStrategy, SearchOptions } from "../domain/SearchStrategy.js";
import { buildSearchResult, type SearchResult } from "../domain/SearchResult.js";
import { StepRecorder } from "./StepRecorder.js";

export class NaiveSearch implements SearchStrategy {
  readonly name = "naive";
  readonly complexity = "O(n*m)";

  search(text: string, pattern: string, options: SearchOptions = {}): SearchResult {
    const start = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    const rec = new StepRecorder(!!options.recordSteps, options.maxSteps);
    let comparisons = 0;

    if (m > 0 && m <= n) {
      for (let s = 0; s <= n - m; s++) {
        let j = 0;
        while (j < m) {
          comparisons++;
          const ok = text[s + j] === pattern[j];
          rec.add({
            shift: s,
            textIndex: s + j,
            patternIndex: j,
            match: ok,
            note: ok
              ? `'${pattern[j]}' casa em texto[${s + j}]`
              : `'${text[s + j]}' ≠ '${pattern[j]}' em texto[${s + j}] → desloca padrão`,
          });
          if (!ok) break;
          j++;
        }
        if (j === m) matches.push(s);
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
    });
  }
}
