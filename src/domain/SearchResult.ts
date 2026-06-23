export interface SearchStep {
  shift: number;
  textIndex: number;
  patternIndex: number;
  match: boolean;
  note: string;
}

export interface SearchResult {
  algorithm: string;
  pattern: string;
  textLength: number;
  patternLength: number;
  matches: number[];
  comparisons: number;
  durationMs: number;
  theoreticalComplexity: string;
  steps: SearchStep[];
  aux: Record<string, unknown>;
}

export function buildSearchResult(params: {
  algorithm: string;
  pattern: string;
  textLength: number;
  matches: number[];
  comparisons: number;
  durationMs: number;
  theoreticalComplexity: string;
  steps?: SearchStep[];
  aux?: Record<string, unknown>;
}): SearchResult {
  return {
    algorithm: params.algorithm,
    pattern: params.pattern,
    textLength: params.textLength,
    patternLength: params.pattern.length,
    matches: params.matches,
    comparisons: params.comparisons,
    durationMs: params.durationMs,
    theoreticalComplexity: params.theoreticalComplexity,
    steps: params.steps ?? [],
    aux: params.aux ?? {},
  };
}
