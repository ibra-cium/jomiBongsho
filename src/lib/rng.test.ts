import { describe, it, expect } from 'vitest';
import { hashString, mulberry32, pick, int, chance, createRng } from './rng';

describe('rng', () => {
  it('hashString deterministically produces a 32-bit unsigned integer', () => {
    const h1 = hashString('jomi-bongsho-2026');
    const h2 = hashString('jomi-bongsho-2026');
    const h3 = hashString('different-seed');

    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).toBeGreaterThanOrEqual(0);
    expect(h1).toBeLessThanOrEqual(0xffffffff);
  });

  it('mulberry32 with same seed generates the same sequence of 5 numbers', () => {
    const seed = hashString('test-seed-42');
    const rng1 = mulberry32(seed);
    const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];

    const rng2 = mulberry32(seed);
    const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
    expect(seq1.every((n) => n >= 0 && n < 1)).toBe(true);
  });

  it('int helper generates integers within [min, max] inclusive', () => {
    const rng = mulberry32(12345);
    const values: number[] = [];
    for (let i = 0; i < 100; i++) {
      values.push(int(10, 20, rng));
    }

    expect(values.every((v) => Number.isInteger(v) && v >= 10 && v <= 20)).toBe(true);
    expect(values.some((v) => v === 10)).toBe(true);
    expect(values.some((v) => v === 20)).toBe(true);
  });

  it('pick helper uniformly selects elements from an array', () => {
    const items = ['apple', 'banana', 'cherry'] as const;
    const rng = mulberry32(999);
    const chosen = pick(items, rng);
    expect(items.includes(chosen)).toBe(true);
  });

  it('chance helper evaluates probabilities accurately', () => {
    const rng = mulberry32(777);
    expect(chance(0, rng)).toBe(false);
    expect(chance(1, rng)).toBe(true);

    let trueCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (chance(0.3, rng)) trueCount++;
    }
    // With 1000 trials, 30% should be roughly around 250-350
    expect(trueCount).toBeGreaterThan(200);
    expect(trueCount).toBeLessThan(400);
  });

  it('createRng object wrapper provides stateful deterministic methods', () => {
    const r1 = createRng('jomi-bongsho-2026');
    const r2 = createRng('jomi-bongsho-2026');

    expect(r1.next()).toBe(r2.next());
    expect(r1.int(1, 100)).toBe(r2.int(1, 100));
    expect(r1.pick(['a', 'b', 'c'])).toBe(r2.pick(['a', 'b', 'c']));
    expect(r1.chance(0.5)).toBe(r2.chance(0.5));
  });
});
