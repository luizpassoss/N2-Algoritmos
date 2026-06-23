import type { SearchResult } from "./SearchResult.js";

export interface SearchOptions {
  recordSteps?: boolean;
  maxSteps?: number;
}

export interface SearchStrategy {
  readonly name: string;
  readonly complexity: string;
  search(text: string, pattern: string, options?: SearchOptions): SearchResult;
}
