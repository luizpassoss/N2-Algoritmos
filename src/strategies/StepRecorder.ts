import type { SearchStep } from "../domain/SearchResult.js";

export class StepRecorder {
  private readonly steps: SearchStep[] = [];
  private readonly enabled: boolean;
  private readonly max: number;

  constructor(enabled: boolean, max = 5000) {
    this.enabled = enabled;
    this.max = max;
  }

  add(step: SearchStep): void {
    if (this.enabled && this.steps.length < this.max) {
      this.steps.push(step);
    }
  }

  getSteps(): SearchStep[] {
    return this.steps;
  }
}
