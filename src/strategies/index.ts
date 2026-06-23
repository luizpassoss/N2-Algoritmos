import type { SearchStrategy } from "../domain/SearchStrategy.js";
import { NaiveSearch } from "./NaiveSearch.js";
import { RabinKarpSearch } from "./RabinKarpSearch.js";
import { KMPSearch } from "./KMPSearch.js";
import { BoyerMooreSearch } from "./BoyerMooreSearch.js";

export { NaiveSearch, RabinKarpSearch, KMPSearch, BoyerMooreSearch };

export const STRATEGIES: Record<string, SearchStrategy> = {
  naive: new NaiveSearch(),
  "rabin-karp": new RabinKarpSearch(),
  kmp: new KMPSearch(),
  "boyer-moore": new BoyerMooreSearch(),
};

export function getStrategy(name: string): SearchStrategy {
  const strategy = STRATEGIES[name];
  if (!strategy) {
    throw new Error(
      `Estratégia desconhecida: "${name}". Disponíveis: ${Object.keys(STRATEGIES).join(", ")}`,
    );
  }
  return strategy;
}

export function listStrategies(): SearchStrategy[] {
  return Object.values(STRATEGIES);
}
