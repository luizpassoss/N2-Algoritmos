import type { SearchStrategy, SearchOptions } from "../domain/SearchStrategy.js";
import { buildSearchResult, type SearchResult } from "../domain/SearchResult.js";
import { StepRecorder } from "./StepRecorder.js";

export class RabinKarpSearch implements SearchStrategy {
  readonly name = "rabin-karp";
  readonly complexity = "O(n+m) médio";

  private static readonly BASE = 256;
  private static readonly MOD = 1_000_000_007;

  search(text: string, pattern: string, options: SearchOptions = {}): SearchResult {
    const start = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    const rec = new StepRecorder(!!options.recordSteps, options.maxSteps);
    let comparisons = 0;
    const { BASE, MOD } = RabinKarpSearch;

    if (m > 0 && m <= n) {
      let high = 1;
      for (let i = 0; i < m - 1; i++) high = (high * BASE) % MOD;

      let patternHash = 0;
      let windowHash = 0;
      for (let i = 0; i < m; i++) {
        patternHash = (patternHash * BASE + pattern.charCodeAt(i)) % MOD;
        windowHash = (windowHash * BASE + text.charCodeAt(i)) % MOD;
      }

      for (let s = 0; s <= n - m; s++) {
        const hashHit = patternHash === windowHash;
        rec.add({
          shift: s,
          textIndex: s,
          patternIndex: -1,
          match: hashHit,
          note: hashHit
            ? `hash da janela = hash do padrão (${windowHash}) → verifica caracteres`
            : `hash difere (janela=${windowHash}, padrão=${patternHash}) → pula janela`,
        });

        if (hashHit) {
          let j = 0;
          while (j < m) {
            comparisons++;
            const ok = text[s + j] === pattern[j];
            rec.add({
              shift: s,
              textIndex: s + j,
              patternIndex: j,
              match: ok,
              note: ok ? `confirma '${pattern[j]}'` : `colisão de hash em texto[${s + j}]`,
            });
            if (!ok) break;
            j++;
          }
          if (j === m) matches.push(s);
        }

        if (s < n - m) {
          windowHash =
            ((windowHash - text.charCodeAt(s) * high) * BASE +
              text.charCodeAt(s + m)) %
            MOD;
          if (windowHash < 0) windowHash += MOD;
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
      aux: { base: BASE, mod: MOD },
    });
  }
}
