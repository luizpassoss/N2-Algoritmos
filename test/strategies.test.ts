import { test } from "node:test";
import assert from "node:assert/strict";
import { STRATEGIES } from "../src/strategies/index.js";
import { KMPSearch } from "../src/strategies/KMPSearch.js";

const text = "abxabcabcaby abcaby abc";

function naiveIndices(t: string, p: string): number[] {
  const res: number[] = [];
  if (!p) return res;
  for (let i = 0; i + p.length <= t.length; i++) {
    if (t.slice(i, i + p.length) === p) res.push(i);
  }
  return res;
}

for (const [name, strategy] of Object.entries(STRATEGIES)) {
  test(`${name}: encontra todas as ocorrências de "abc"`, () => {
    const r = strategy.search(text, "abc");
    assert.deepEqual(r.matches, naiveIndices(text, "abc"));
    assert.equal(r.algorithm, name);
    assert.ok(r.comparisons > 0);
  });

  test(`${name}: padrão inexistente retorna vazio`, () => {
    const r = strategy.search(text, "zzz");
    assert.deepEqual(r.matches, []);
  });

  test(`${name}: padrão no início e no fim`, () => {
    const t = "abc meio abc";
    const r = strategy.search(t, "abc");
    assert.deepEqual(r.matches, naiveIndices(t, "abc"));
  });

  test(`${name}: padrão maior que o texto retorna vazio`, () => {
    const r = strategy.search("ab", "abcdef");
    assert.deepEqual(r.matches, []);
  });

  test(`${name}: ocorrências sobrepostas (aaaa / aa)`, () => {
    const r = strategy.search("aaaa", "aa");
    assert.deepEqual(r.matches, [0, 1, 2]);
  });

  test(`${name}: grava passos quando solicitado`, () => {
    const r = strategy.search(text, "abc", { recordSteps: true });
    assert.ok(r.steps.length > 0);
  });
}

test("KMP: tabela LPS de 'ababaca'", () => {
  assert.deepEqual(KMPSearch.buildLPS("ababaca"), [0, 0, 1, 2, 3, 0, 1]);
});
