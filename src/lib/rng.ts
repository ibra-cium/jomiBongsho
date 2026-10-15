/**
 * Seeded Pseudo-Random Number Generator (PRNG)
 * Uses 32-bit FNV-1a string hashing and the Mulberry32 algorithm.
 */

/**
 * Deterministically hashes an arbitrary string to a 32-bit unsigned integer (FNV-1a).
 */
export function hashString(str: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 32-bit PRNG generator.
 * Returns a generator function yielding numbers in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a random integer in [min, max] inclusive.
 */
export function int(min: number, max: number, rand: () => number): number {
  if (min > max) {
    throw new Error(`min (${min}) must be less than or equal to max (${max})`);
  }
  return min + Math.floor(rand() * (max - min + 1));
}

/**
 * Randomly picks an item from a non-empty array.
 */
export function pick<T>(arr: readonly T[], rand: () => number): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick from an empty array');
  }
  const index = Math.floor(rand() * arr.length);
  const item = arr[index];
  if (item === undefined) {
    throw new Error('Picked undefined array element');
  }
  return item;
}

/**
 * Returns true with probability p (where p is in [0, 1]).
 */
export function chance(p: number, rand: () => number): boolean {
  if (p <= 0) return false;
  if (p >= 1) return true;
  return rand() < p;
}

export interface RngInstance {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  chance: (p: number) => boolean;
}

/**
 * Creates a stateful seeded RNG instance.
 */
export function createRng(seed: string | number): RngInstance {
  const seedNum = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  const next = mulberry32(seedNum);
  return {
    next,
    int: (min, max) => int(min, max, next),
    pick: (arr) => pick(arr, next),
    chance: (p) => chance(p, next),
  };
}
