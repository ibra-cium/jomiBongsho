import { describe, it, expect } from 'vitest';
import { calculateCost } from './cost';
import type { FeeRules } from './types';

// Standard demo fee rules fixture matching public/data/feeRules.json
const mockFeeRules: FeeRules = {
  fiscalYear: '2025-26',
  status: 'DEMO — verify every rate with the official registration cost calculator before real use',
  sources: [
    {
      label: 'Dhaka Tribune, 2 Jun 2025 — Land registration cost reduced',
      url: 'https://www.dhakatribune.com/bangladesh/382928/land-registration-cost-reduced',
    },
    {
      label: 'The Financial Express, 2022 — e-mutation fee breakdown',
      url: 'https://thefinancialexpress.com.bd/national/bangladesh-mandates-online-payment-of-land-mutation-fees-1664697255',
    },
  ],
  bp: {
    stampDuty: 150, // 1.5%
    registrationFee: 100, // 1.0%
    localGovtTax: {
      union: 200, // 2.0%
      pourashava: 300, // 3.0%
      city: 300, // 3.0%
    },
    sourceTax: {
      A: 600, // 6.0%
      B: 400, // 4.0%
      C: 300, // 3.0%
    },
  },
  fixedFeesBdt: {
    eFee: 100,
    nFee: 100,
    courtFee: 20,
    affidavitStamp: 200,
  },
  mutationFeesBdt: {
    courtFee: 20,
    noticeFee: 50,
    recordCorrection: 1000,
    ledgerCopy: 100,
  },
};

describe('calculateCost', () => {
  describe('Hand calculation acceptance test', () => {
    it('matches exact manual hand calculation for a 10.0 decimal plot in Manikganj (Union, Class C)', () => {
      // 10 decimal plot at 10,00,000 BDT (10 lakh)
      // pricePaisa = 100,000,000 paisa
      // Stamp duty: 150 bp (1.50%) = 15,000 BDT (1,500,000 paisa)
      // Registration fee: 100 bp (1.00%) = 10,000 BDT (1,000,000 paisa)
      // Local Govt tax (union): 200 bp (2.00%) = 20,000 BDT (2,000,000 paisa)
      // Source tax (C): 300 bp (3.00%) = 30,000 BDT (3,000,000 paisa)
      // Fixed fees: 100 + 100 + 20 + 200 = 420 BDT (42,000 paisa)
      // Mutation fees: 20 + 50 + 1000 + 100 = 1,170 BDT (117,000 paisa)
      // Arrears: 0 BDT
      // Total fees = 15,000 + 10,000 + 20,000 + 30,000 + 420 + 1,170 = 76,590 BDT (7,659,000 paisa)
      // Grand total = 10,00,000 + 76,590 = 10,76,590 BDT (107,659,000 paisa)
      // Effective rate = 76,590 / 1,000,000 = 7.659%
      const result = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: true,
        arrearsBdt: 0,
      });

      expect(result.landPriceBdt).toBe(1_000_000);
      expect(result.landPricePaisa).toBe(100_000_000);
      expect(result.feesTotalBdt).toBe(76_590);
      expect(result.feesTotalPaisa).toBe(7_659_000);
      expect(result.grandTotalBdt).toBe(1_076_590);
      expect(result.grandTotalPaisa).toBe(107_659_000);
      expect(result.effectiveRatePct).toBeCloseTo(7.659, 3);

      // Verify line items order and exact amounts
      expect(result.lines.map((l) => l.id)).toEqual([
        'stampDuty',
        'registrationFee',
        'localGovtTax',
        'sourceTax',
        'fixedFees',
        'mutationFee',
      ]);

      const stamp = result.lines.find((l) => l.id === 'stampDuty')!;
      expect(stamp.amountBdt).toBe(15_000);
      expect(stamp.amountPaisa).toBe(1_500_000);
      expect(stamp.basisPoints).toBe(150);

      const reg = result.lines.find((l) => l.id === 'registrationFee')!;
      expect(reg.amountBdt).toBe(10_000);
      expect(reg.amountPaisa).toBe(1_000_000);
      expect(reg.basisPoints).toBe(100);

      const localGovt = result.lines.find((l) => l.id === 'localGovtTax')!;
      expect(localGovt.amountBdt).toBe(20_000);
      expect(localGovt.amountPaisa).toBe(2_000_000);
      expect(localGovt.basisPoints).toBe(200);

      const sourceTax = result.lines.find((l) => l.id === 'sourceTax')!;
      expect(sourceTax.amountBdt).toBe(30_000);
      expect(sourceTax.amountPaisa).toBe(3_000_000);
      expect(sourceTax.basisPoints).toBe(300);

      const fixed = result.lines.find((l) => l.id === 'fixedFees')!;
      expect(fixed.amountBdt).toBe(420);
      expect(fixed.amountPaisa).toBe(42_000);
      expect(fixed.subItems).toHaveLength(4);

      const mutation = result.lines.find((l) => l.id === 'mutationFee')!;
      expect(mutation.amountBdt).toBe(1_170);
      expect(mutation.amountPaisa).toBe(117_000);
      expect(mutation.subItems).toHaveLength(4);
    });
  });

  describe('Source tax toggle (buyerPaysSourceTax)', () => {
    it('excludes source tax from buyer fee total when buyerPaysSourceTax is false', () => {
      const withSourceTax = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: true,
      });

      const withoutSourceTax = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: false,
      });

      expect(withoutSourceTax.lines.some((l) => l.id === 'sourceTax')).toBe(false);
      expect(withoutSourceTax.feesTotalBdt).toBe(withSourceTax.feesTotalBdt - 30_000);
      expect(withoutSourceTax.feesTotalBdt).toBe(46_590);
      expect(withoutSourceTax.grandTotalBdt).toBe(1_046_590);
      expect(withoutSourceTax.buyerPaysSourceTax).toBe(false);
    });
  });

  describe('Area classes and Source tax classes', () => {
    it('calculates correct local government tax for pourashava (300 bp) and city (300 bp)', () => {
      const pourashava = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'pourashava',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
      });
      const localGovtP = pourashava.lines.find((l) => l.id === 'localGovtTax')!;
      expect(localGovtP.basisPoints).toBe(300);
      expect(localGovtP.amountBdt).toBe(30_000);

      const city = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'city',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
      });
      const localGovtC = city.lines.find((l) => l.id === 'localGovtTax')!;
      expect(localGovtC.basisPoints).toBe(300);
      expect(localGovtC.amountBdt).toBe(30_000);
    });

    it('calculates correct source tax for class A (600 bp) and class B (400 bp)', () => {
      const classA = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'A',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: true,
      });
      const sourceA = classA.lines.find((l) => l.id === 'sourceTax')!;
      expect(sourceA.basisPoints).toBe(600);
      expect(sourceA.amountBdt).toBe(60_000);

      const classB = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'B',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: true,
      });
      const sourceB = classB.lines.find((l) => l.id === 'sourceTax')!;
      expect(sourceB.basisPoints).toBe(400);
      expect(sourceB.amountBdt).toBe(40_000);
    });
  });

  describe('Land tax arrears (Dag 112)', () => {
    it('includes arrears line and adds to total fees when arrearsBdt > 0', () => {
      const result = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        arrearsBdt: 18_500, // Dag 112 scenario
      });

      const arrearsLine = result.lines.find((l) => l.id === 'landTaxArrears');
      expect(arrearsLine).toBeDefined();
      expect(arrearsLine?.amountBdt).toBe(18_500);
      expect(arrearsLine?.amountPaisa).toBe(1_850_000);
      expect(result.feesTotalBdt).toBe(76_590 + 18_500); // 95,090 BDT
      expect(result.grandTotalBdt).toBe(1_000_000 + 95_090); // 1,095,090 BDT
    });

    it('does not include arrears line when arrearsBdt is 0 or undefined', () => {
      const result = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        arrearsBdt: 0,
      });

      expect(result.lines.some((l) => l.id === 'landTaxArrears')).toBe(false);
    });
  });

  describe('Integer paisa and half-up rounding', () => {
    it('applies exact half-up rounding formula: Math.floor((pricePaisa * bp + 5000) / 10000)', () => {
      // Test rounding boundary on odd numbers
      // Say declaredPrice is 33.33 BDT => pricePaisa = 3333
      // For stampDuty (bp = 150):
      // 3333 * 150 = 499950
      // 499950 + 5000 = 504950
      // 504950 / 10000 = 50 paisa (0.50 BDT)
      const res = calculateCost({
        declaredPriceBdt: 33.33,
        recordedAreaDecimal: 1.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        buyerPaysSourceTax: false,
      });

      const stamp = res.lines.find((l) => l.id === 'stampDuty')!;
      expect(stamp.amountPaisa).toBe(50);
      expect(stamp.amountBdt).toBe(0.5);
    });
  });

  describe('Under-declaration warning (below 50% of estimate mid)', () => {
    it('flags isUnderDeclared when price per decimal is strictly less than 50% of estimate mid', () => {
      // Area = 10 decimal
      // Estimate mid = 300,000 BDT/decimal
      // 50% threshold = 150,000 BDT/decimal (total 1,500,000 BDT)
      const estimateMid = 300_000;

      // 1) 1,400,000 BDT (140,000/dec < 150,000) -> under-declared
      const under = calculateCost({
        declaredPriceBdt: 1_400_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        estimateMidPerDecimalBdt: estimateMid,
      });
      expect(under.isUnderDeclared).toBe(true);
      expect(under.underDeclaredThresholdBdt).toBe(150_000);

      // 2) 1,500,000 BDT (150,000/dec == threshold) -> NOT under-declared
      const atThreshold = calculateCost({
        declaredPriceBdt: 1_500_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        estimateMidPerDecimalBdt: estimateMid,
      });
      expect(atThreshold.isUnderDeclared).toBe(false);

      // 3) 2,000,000 BDT (200,000/dec > threshold) -> NOT under-declared
      const normal = calculateCost({
        declaredPriceBdt: 2_000_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
        estimateMidPerDecimalBdt: estimateMid,
      });
      expect(normal.isUnderDeclared).toBe(false);
    });

    it('does not flag under-declared if estimate is not available', () => {
      const res = calculateCost({
        declaredPriceBdt: 100_000,
        recordedAreaDecimal: 10.0,
        areaClass: 'union',
        sourceTaxClass: 'C',
        feeRules: mockFeeRules,
      });
      expect(res.isUnderDeclared).toBe(false);
    });
  });
});
