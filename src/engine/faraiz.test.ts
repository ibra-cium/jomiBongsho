import { describe, it, expect } from 'vitest';
import { faraiz } from './faraiz';
import { sumShares, isOne, shareToDecimal } from './fraction';
import type { Relation } from './types';

describe('faraiz', () => {
  describe('supported cases', () => {
    it('calculates exact shares for dag 103: wife + 2 sons + 1 daughter', () => {
      // 30 decimal estate; male deceased (Abdul Malek / Azizul Huq)
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'wife-1', relation: 'wife' },
          { personId: 'son-1', relation: 'son' },
          { personId: 'son-2', relation: 'son' },
          { personId: 'daughter-1', relation: 'daughter' },
        ],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      expect(result.shares).toHaveLength(4);

      const wife = result.shares.find((s) => s.personId === 'wife-1')!;
      const son1 = result.shares.find((s) => s.personId === 'son-1')!;
      const son2 = result.shares.find((s) => s.personId === 'son-2')!;
      const daughter1 = result.shares.find((s) => s.personId === 'daughter-1')!;

      // Exact fractions
      expect(wife.share).toBe('1/8');
      expect(wife.ruleKey).toBe('WIFE_WITH_CHILD');

      expect(son1.share).toBe('7/20');
      expect(son1.ruleKey).toBe('CHILDREN_RESIDUE');

      expect(son2.share).toBe('7/20');
      expect(son2.ruleKey).toBe('CHILDREN_RESIDUE');

      expect(daughter1.share).toBe('7/40');
      expect(daughter1.ruleKey).toBe('CHILDREN_RESIDUE');

      // Exact sum must equal 1
      const total = sumShares(result.shares.map((s) => s.share));
      expect(isOne(total)).toBe(true);

      // Decimals on 30 decimal plot: 3.75 + 10.5 + 10.5 + 5.25 = 30
      expect(shareToDecimal(wife.share, 30)).toBe(3.75);
      expect(shareToDecimal(son1.share, 30)).toBe(10.5);
      expect(shareToDecimal(son2.share, 30)).toBe(10.5);
      expect(shareToDecimal(daughter1.share, 30)).toBe(5.25);
    });

    it('calculates exact shares for female deceased: husband + son + daughter', () => {
      const result = faraiz({
        deceasedSex: 'F',
        law: 'muslim',
        heirs: [
          { personId: 'h', relation: 'husband' },
          { personId: 's', relation: 'son' },
          { personId: 'd', relation: 'daughter' },
        ],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      const husband = result.shares.find((s) => s.personId === 'h')!;
      const son = result.shares.find((s) => s.personId === 's')!;
      const daughter = result.shares.find((s) => s.personId === 'd')!;

      expect(husband.share).toBe('1/4');
      expect(husband.ruleKey).toBe('HUSBAND_WITH_CHILD');

      expect(son.share).toBe('1/2');
      expect(son.ruleKey).toBe('CHILDREN_RESIDUE');

      expect(daughter.share).toBe('1/4');
      expect(daughter.ruleKey).toBe('CHILDREN_RESIDUE');

      const total = sumShares(result.shares.map((s) => s.share));
      expect(isOne(total)).toBe(true);
    });

    it('calculates exact shares for 2 wives + father + mother + 1 son', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'w1', relation: 'wife' },
          { personId: 'w2', relation: 'wife' },
          { personId: 'f', relation: 'father' },
          { personId: 'm', relation: 'mother' },
          { personId: 's', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      const w1 = result.shares.find((s) => s.personId === 'w1')!;
      const w2 = result.shares.find((s) => s.personId === 'w2')!;
      const father = result.shares.find((s) => s.personId === 'f')!;
      const mother = result.shares.find((s) => s.personId === 'm')!;
      const son = result.shares.find((s) => s.personId === 's')!;

      // 1/8 total for wives divided equally between 2 wives = 1/16 each
      expect(w1.share).toBe('1/16');
      expect(w1.ruleKey).toBe('WIFE_WITH_CHILD');
      expect(w2.share).toBe('1/16');
      expect(w2.ruleKey).toBe('WIFE_WITH_CHILD');

      expect(father.share).toBe('1/6');
      expect(father.ruleKey).toBe('FATHER_WITH_SON');

      expect(mother.share).toBe('1/6');
      expect(mother.ruleKey).toBe('MOTHER_WITH_CHILD');

      // Residue = 1 - (1/8 + 1/6 + 1/6) = 1 - 11/24 = 13/24
      expect(son.share).toBe('13/24');
      expect(son.ruleKey).toBe('CHILDREN_RESIDUE');

      const total = sumShares(result.shares.map((s) => s.share));
      expect(isOne(total)).toBe(true);
    });

    it('calculates exact shares for sole heir (1 son)', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [{ personId: 's1', relation: 'son' }],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      expect(result.shares).toHaveLength(1);
      expect(result.shares[0]!.share).toBe('1/1');
      expect(result.shares[0]!.ruleKey).toBe('CHILDREN_RESIDUE');
      expect(isOne(result.shares[0]!.share)).toBe(true);
    });

    it('calculates exact shares for multiple sons only', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 's1', relation: 'son' },
          { personId: 's2', relation: 'son' },
          { personId: 's3', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      expect(result.shares).toHaveLength(3);
      for (const s of result.shares) {
        expect(s.share).toBe('1/3');
        expect(s.ruleKey).toBe('CHILDREN_RESIDUE');
      }
      expect(isOne(sumShares(result.shares.map((s) => s.share)))).toBe(true);
    });

    it('preserves the order of input heirs in the returned shares array', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'son-b', relation: 'son' },
          { personId: 'wife-a', relation: 'wife' },
          { personId: 'daughter-c', relation: 'daughter' },
        ],
      });

      expect(result.supported).toBe(true);
      if (!result.supported) return;

      expect(result.shares.map((s) => s.personId)).toEqual(['son-b', 'wife-a', 'daughter-c']);
    });
  });

  describe('unsupported cases and error codes', () => {
    it('returns NO_SON when heirs have daughters only', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'w', relation: 'wife' },
          { personId: 'd1', relation: 'daughter' },
          { personId: 'd2', relation: 'daughter' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('NO_SON');
    });

    it('returns NO_SON when heirs have no children at all', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'w', relation: 'wife' },
          { personId: 'f', relation: 'father' },
          { personId: 'm', relation: 'mother' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('NO_SON');
    });

    it('returns UNSUPPORTED_RELATION when brother or other relation is present', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'd1', relation: 'daughter' },
          { personId: 'b1', relation: 'brother' as Relation },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('UNSUPPORTED_RELATION');
    });

    it('returns UNSUPPORTED_RELATION when multiple fathers or mothers are specified', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 's', relation: 'son' },
          { personId: 'f1', relation: 'father' },
          { personId: 'f2', relation: 'father' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('UNSUPPORTED_RELATION');
    });

    it('returns HINDU_LAW for non-Muslim inheritance law', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'hindu',
        heirs: [
          { personId: 's1', relation: 'son' },
          { personId: 'w1', relation: 'wife' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('HINDU_LAW');
    });

    it('returns NO_HEIRS when heirs list is empty', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('NO_HEIRS');
    });

    it('returns INVALID_SPOUSE when husband is listed for male deceased', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'h1', relation: 'husband' },
          { personId: 's1', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('INVALID_SPOUSE');
    });

    it('returns INVALID_SPOUSE when wife is listed for female deceased', () => {
      const result = faraiz({
        deceasedSex: 'F',
        law: 'muslim',
        heirs: [
          { personId: 'w1', relation: 'wife' },
          { personId: 's1', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('INVALID_SPOUSE');
    });

    it('returns INVALID_SPOUSE when more than 1 husband is listed', () => {
      const result = faraiz({
        deceasedSex: 'F',
        law: 'muslim',
        heirs: [
          { personId: 'h1', relation: 'husband' },
          { personId: 'h2', relation: 'husband' },
          { personId: 's1', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('INVALID_SPOUSE');
    });

    it('returns INVALID_SPOUSE when more than 4 wives are listed', () => {
      const result = faraiz({
        deceasedSex: 'M',
        law: 'muslim',
        heirs: [
          { personId: 'w1', relation: 'wife' },
          { personId: 'w2', relation: 'wife' },
          { personId: 'w3', relation: 'wife' },
          { personId: 'w4', relation: 'wife' },
          { personId: 'w5', relation: 'wife' },
          { personId: 's1', relation: 'son' },
        ],
      });

      expect(result.supported).toBe(false);
      if (result.supported) return;
      expect(result.reason).toBe('INVALID_SPOUSE');
    });
  });

  describe('property-based test: random supported heir sets always sum to 1', () => {
    it('always produces exact shares summing to 1 across 200 random supported configurations', () => {
      // Deterministic PRNG for repeatability
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      const randInt = (min: number, max: number) =>
        Math.floor(pseudoRandom() * (max - min + 1)) + min;

      for (let trial = 0; trial < 200; trial++) {
        const deceasedSex: 'M' | 'F' = pseudoRandom() < 0.5 ? 'M' : 'F';
        const heirs: { personId: string; relation: Relation }[] = [];

        // Spouses
        if (deceasedSex === 'M') {
          const numWives = randInt(0, 4);
          for (let i = 0; i < numWives; i++) {
            heirs.push({ personId: `wife-${i}`, relation: 'wife' });
          }
        } else {
          const hasHusband = randInt(0, 1);
          if (hasHusband) {
            heirs.push({ personId: 'husband', relation: 'husband' });
          }
        }

        // Parents
        if (randInt(0, 1) === 1) {
          heirs.push({ personId: 'father', relation: 'father' });
        }
        if (randInt(0, 1) === 1) {
          heirs.push({ personId: 'mother', relation: 'mother' });
        }

        // Sons: at least 1, up to 6
        const numSons = randInt(1, 6);
        for (let i = 0; i < numSons; i++) {
          heirs.push({ personId: `son-${i}`, relation: 'son' });
        }

        // Daughters: 0 to 6
        const numDaughters = randInt(0, 6);
        for (let i = 0; i < numDaughters; i++) {
          heirs.push({ personId: `daughter-${i}`, relation: 'daughter' });
        }

        const res = faraiz({ deceasedSex, law: 'muslim', heirs });
        expect(res.supported).toBe(true);
        if (!res.supported) continue;

        expect(res.shares).toHaveLength(heirs.length);

        const total = sumShares(res.shares.map((s) => s.share));
        expect(isOne(total)).toBe(true);

        for (const row of res.shares) {
          expect(row.share).toMatch(/^\d+\/\d+$/);
          expect([
            'WIFE_WITH_CHILD',
            'HUSBAND_WITH_CHILD',
            'FATHER_WITH_SON',
            'MOTHER_WITH_CHILD',
            'CHILDREN_RESIDUE',
          ]).toContain(row.ruleKey);
        }
      }
    });
  });
});
