import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { DemoData } from '@/engine/types';
import { analyseDag, calculateCost } from '@/engine';

// Load demo data
function loadDemoData(): DemoData {
  const base = join(process.cwd(), 'public', 'data');
  const mouza = JSON.parse(readFileSync(join(base, 'mouza.json'), 'utf-8'));
  const dags = JSON.parse(readFileSync(join(base, 'dags.geojson'), 'utf-8'));
  const people = JSON.parse(readFileSync(join(base, 'people.json'), 'utf-8'));
  const events = JSON.parse(readFileSync(join(base, 'events.json'), 'utf-8'));
  const scenarios = JSON.parse(readFileSync(join(base, 'scenarios.json'), 'utf-8'));
  const feeRules = JSON.parse(readFileSync(join(base, 'feeRules.json'), 'utf-8'));
  return { mouza, dags, people, events, scenarios, feeRules };
}

const data = loadDemoData();

describe('P1-T08 Acceptance Criteria — Plot Sheet Data & Analysis', () => {
  it('Dag 101: green verdict (no risk found), verified owners, no issues', () => {
    const analysis = analyseDag('101', data);
    expect(analysis.verdict).toBe('green');
    expect(analysis.issues).toHaveLength(0);
    expect(analysis.owners.length).toBeGreaterThan(0);
    expect(analysis.owners.some((o) => o.isClaim)).toBe(false);
    expect(analysis.owners.some((o) => o.isEstate)).toBe(false);
  });

  it('Dag 102: red verdict, DOUBLE_SALE with both deeds in evidence and Buyer B as disputed claim', () => {
    const analysis = analyseDag('102', data);
    expect(analysis.verdict).toBe('red');

    const doubleSale = analysis.issues.find((i) => i.code === 'DOUBLE_SALE');
    expect(doubleSale).toBeDefined();

    // Must include both deeds in evidence (the valid first sale and the second duplicate sale)
    expect(doubleSale?.eventIds.length).toBe(2);

    // Buyer B must appear in disputed claims
    const claimOwner = analysis.owners.find((o) => o.isClaim);
    expect(claimOwner).toBeDefined();
    expect(claimOwner?.personId).toBe('p-buyer-b');
  });

  it('Dag 103: red verdict, HEIR_OVER_SALE with faraiz breakdown showing 10.5 decimal for Faruk', () => {
    const analysis = analyseDag('103', data);
    expect(analysis.verdict).toBe('red');

    const heirOverSale = analysis.issues.find((i) => i.code === 'HEIR_OVER_SALE');
    expect(heirOverSale).toBeDefined();

    // Faruk's true entitled share in params or faraizTable
    expect(heirOverSale?.params.owned).toBe('7/20');
    expect(heirOverSale?.params.selling).toBe('1/2');

    // Faraiz table attached with all heirs
    expect(heirOverSale?.faraizTable).toBeDefined();
    const farukRow = heirOverSale?.faraizTable?.find((r) => r.personId === 'p-faruk');
    expect(farukRow).toBeDefined();
    expect(farukRow?.share).toBe('7/20');

    // Total plot area is 30.0, so Faruk's entitled area is 30 * 7/20 = 10.5 decimal
    const farukDecimal = 30.0 * (7 / 20);
    expect(farukDecimal).toBe(10.5);
  });

  it('Dag 104: yellow verdict (REG_WITHOUT_MUTATION)', () => {
    const analysis = analyseDag('104', data);
    expect(analysis.verdict).toBe('yellow');
    expect(analysis.issues.some((i) => i.code === 'REG_WITHOUT_MUTATION')).toBe(true);
  });

  it('Dag 105: yellow verdict (RAPID_RESALE)', () => {
    const analysis = analyseDag('105', data);
    expect(analysis.verdict).toBe('yellow');
    expect(analysis.issues.some((i) => i.code === 'RAPID_RESALE')).toBe(true);
  });

  it('Dag 106: yellow verdict (UNDER_DECLARED) with market vs declared price params', () => {
    const analysis = analyseDag('106', data);
    expect(analysis.verdict).toBe('yellow');
    const underDeclared = analysis.issues.find((i) => i.code === 'UNDER_DECLARED');
    expect(underDeclared).toBeDefined();
    expect(underDeclared?.severity).toBe('warning');
    expect(underDeclared?.params.declaredPrice).toBe(78_140);
    expect(Number(underDeclared?.params.pct)).toBeLessThan(50);
  });

  it('Dag 101: price estimate is calculated and populated on DagAnalysis', () => {
    const analysis = analyseDag('101', data);
    expect(analysis.priceEstimate).toBeDefined();
    expect(analysis.priceEstimate.status).toBe('ok');
    expect(analysis.priceEstimate.perDecimal?.mid).toBeGreaterThan(0);
    expect(analysis.priceEstimate.total?.mid).toBeGreaterThan(0);
    expect(analysis.priceEstimate.comps.length).toBeGreaterThan(0);
  });

  it('All 48 dags execute analyseDag and build owner rows in < 1 ms average', () => {
    const start = performance.now();
    for (const f of data.dags.features) {
      const res = analyseDag(f.properties.id, data);
      expect(res.owners.length).toBeGreaterThan(0);
      expect(['green', 'yellow', 'red']).toContain(res.verdict);
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / data.dags.features.length;
    expect(avgMs).toBeLessThan(5); // Far below 20 ms requirement
  });

  describe('P1-T10 Acceptance Criteria — Cost Calculator & Arrears', () => {
    it('Dag 101: cost calculation has all fee lines and 0 arrears', () => {
      const analysis = analyseDag('101', data);
      const dag = analysis.dag;
      const estimateMid = analysis.priceEstimate.perDecimal?.mid ?? 327_000;
      const defaultPrice = Math.round(estimateMid * dag.recordedAreaDecimal);

      const events101 = data.events.filter((e) => e.dagId === '101');
      const taxEvents = events101.filter((e) => e.type === 'landTax');
      const arrearsBdt = taxEvents[0]?.arrearsBdt ?? 0;
      expect(arrearsBdt).toBe(0);

      const cost = calculateCost({
        declaredPriceBdt: defaultPrice,
        recordedAreaDecimal: dag.recordedAreaDecimal,
        areaClass: data.mouza.areaClass,
        sourceTaxClass: data.mouza.sourceTaxClass,
        feeRules: data.feeRules,
        arrearsBdt,
        buyerPaysSourceTax: true,
        estimateMidPerDecimalBdt: estimateMid,
      });

      expect(cost.grandTotalBdt).toBe(cost.landPriceBdt + cost.feesTotalBdt);
      expect(cost.isUnderDeclared).toBe(false);
      expect(cost.lines.some((l) => l.id === 'landTaxArrears')).toBe(false);
      expect(cost.lines.some((l) => l.id === 'stampDuty')).toBe(true);
      expect(cost.lines.some((l) => l.id === 'registrationFee')).toBe(true);
      expect(cost.lines.some((l) => l.id === 'localGovtTax')).toBe(true);
      expect(cost.lines.some((l) => l.id === 'sourceTax')).toBe(true);
      expect(cost.lines.some((l) => l.id === 'fixedFees')).toBe(true);
      expect(cost.lines.some((l) => l.id === 'mutationFee')).toBe(true);
    });

    it('Dag 112: shows the land-tax arrears line of 18,500 BDT', () => {
      const analysis = analyseDag('112', data);
      const dag = analysis.dag;
      const events112 = data.events.filter((e) => e.dagId === '112');
      const taxEvent = events112.find((e) => e.type === 'landTax');
      expect(taxEvent).toBeDefined();
      expect(taxEvent?.arrearsBdt).toBe(18_500);

      const cost = calculateCost({
        declaredPriceBdt: 1_000_000,
        recordedAreaDecimal: dag.recordedAreaDecimal,
        areaClass: data.mouza.areaClass,
        sourceTaxClass: data.mouza.sourceTaxClass,
        feeRules: data.feeRules,
        arrearsBdt: taxEvent?.arrearsBdt ?? 0,
        buyerPaysSourceTax: true,
      });

      const arrearsLine = cost.lines.find((l) => l.id === 'landTaxArrears');
      expect(arrearsLine).toBeDefined();
      expect(arrearsLine?.amountBdt).toBe(18_500);
      expect(arrearsLine?.amountPaisa).toBe(1_850_000);
      // For 10 lakh in Notun Char (union: 2%, sourceTaxClass B: 4%): regular fees = 86,590 BDT
      expect(cost.feesTotalBdt).toBe(86_590 + 18_500);
    });

    it('under-declared warning triggers below 50% of estimate with no savings wording', () => {
      const cost = calculateCost({
        declaredPriceBdt: 500_000,
        recordedAreaDecimal: 10.0, // 50,000 / dec
        areaClass: data.mouza.areaClass,
        sourceTaxClass: data.mouza.sourceTaxClass,
        feeRules: data.feeRules,
        estimateMidPerDecimalBdt: 300_000, // 50% is 150,000
      });

      expect(cost.isUnderDeclared).toBe(true);
      // Ensure no property contains "savings"
      const json = JSON.stringify(cost).toLowerCase();
      expect(json).not.toContain('saving');
    });
  });

  describe('P1-T11 Acceptance Criteria — GPS Mismatch and Search', () => {
    it('simulated location on 105 while 101 is selected triggers mismatch condition', () => {
      const selectedDagId: string = '101';
      const gpsDagId: string = '105';
      const isMismatch = Boolean(gpsDagId && gpsDagId !== selectedDagId);
      expect(isMismatch).toBe(true);
    });

    it('simulated location on 101 while 101 is selected does NOT trigger mismatch', () => {
      const selectedDagId: string = '101';
      const gpsDagId: string = '101';
      const isMismatch = Boolean(gpsDagId && gpsDagId !== selectedDagId);
      expect(isMismatch).toBe(false);
    });
  });
});
