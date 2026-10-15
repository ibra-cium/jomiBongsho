/**
 * Seeded Synthetic Data Generator for Jomi Bongsho Demo Mouza
 * Adhering strictly to DATA.md, DOMAIN_RULES.md, and AGENTS.md
 */
import fs from 'node:fs';
import path from 'node:path';
import area from '@turf/area';
import Fraction from 'fraction.js';
import type {
  DagProps,
  DeedEvent,
  Feature,
  FeatureCollection,
  FeeRules,
  GeoPolygon,
  Holding,
  LandClass,
  LandEvent,
  Mouza,
  MutationEvent,
  Person,
  RecordEvent,
} from '../src/engine/types';
import { createRng } from '../src/lib/rng';
import {
  BASE_PRICES_2026,
  DEMO_TODAY,
  FEMALE_FIRST_NAMES,
  GRID,
  MALE_FIRST_NAMES,
  MOUZA_CENTER,
  SEED,
  SURNAMES,
} from './config';
import { getScenarioEvents, SCENARIOS, SCENARIO_PEOPLE } from './scenarios';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/data');

const FEE_RULES: FeeRules = {
  fiscalYear: '2025-26',
  status: 'DEMO — verify every rate with the official registration cost calculator before real use',
  sources: [
    {
      label:
        'Dhaka Tribune, 2 Jun 2025 — Land registration cost reduced (source tax 6/4/3% by area)',
      url: 'https://www.dhakatribune.com/bangladesh/382928/land-registration-cost-reduced',
    },
    {
      label: 'The Financial Express, 2022 — e-mutation fee breakdown (Tk 1,170)',
      url: 'https://thefinancialexpress.com.bd/national/bangladesh-mandates-online-payment-of-land-mutation-fees-1664697255',
    },
  ],
  bp: {
    stampDuty: 150,
    registrationFee: 100,
    localGovtTax: { union: 200, pourashava: 300, city: 300 },
    sourceTax: { A: 600, B: 400, C: 300 },
  },
  fixedFeesBdt: { eFee: 100, nFee: 100, courtFee: 20, affidavitStamp: 200 },
  mutationFeesBdt: { courtFee: 20, noticeFee: 50, recordCorrection: 1000, ledgerCopy: 100 },
};

function formatIsoDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
}

export function generateData() {
  const rng = createRng(SEED);

  // 1. Generate People pool (140+ people)
  const peopleMap = new Map<string, Person>();
  for (const sp of SCENARIO_PEOPLE) {
    peopleMap.set(sp.id, sp);
  }

  let personIdx = 1;
  while (peopleMap.size < 150) {
    const id = `p-gen-${personIdx++}`;
    const isMale = rng.chance(0.5);
    const firstName = isMale ? rng.pick(MALE_FIRST_NAMES) : rng.pick(FEMALE_FIRST_NAMES);
    const surname = rng.pick(SURNAMES);
    peopleMap.set(id, {
      id,
      nameBn: `${firstName.bn} ${surname.bn}`,
      nameEn: `${firstName.en} ${surname.en}`,
      sex: isMale ? 'M' : 'F',
    });
  }

  const people = Array.from(peopleMap.values());
  const normalPeoplePool = people.filter((p) => p.id.startsWith('p-gen-'));

  // 2. Geometry: (cols + 1) x (rows + 1) node grid
  const centerLng = MOUZA_CENTER[0];
  const centerLat = MOUZA_CENTER[1];
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const mToLat = 1 / 111320;
  const mToLng = 1 / (111320 * cosLat);

  function metersToCoord(xMeters: number, yMeters: number): [number, number] {
    return [centerLng + xMeters * mToLng, centerLat + yMeters * mToLat];
  }

  const cols = GRID.cols; // 8
  const rows = GRID.rows; // 6
  const cellM = GRID.cellMeters; // 40
  const jitterM = GRID.jitterMeters; // 6

  const totalWidth = cols * cellM; // 320m
  const totalHeight = rows * cellM; // 240m
  const xOrigin = -totalWidth / 2; // -160m
  const yOrigin = -totalHeight / 2; // -120m

  // Node array [c][r] = [xMeters, yMeters]
  const nodes: [number, number][][] = [];
  for (let c = 0; c <= cols; c++) {
    const colNodes: [number, number][] = [];
    for (let r = 0; r <= rows; r++) {
      let x = xOrigin + c * cellM;
      let y = yOrigin + r * cellM;

      // Inner nodes jittered
      if (c > 0 && c < cols && r > 0 && r < rows) {
        x += (rng.next() * 2 - 1) * jitterM;
        y += (rng.next() * 2 - 1) * jitterM;
      }
      colNodes.push([x, y]);
    }
    nodes.push(colNodes);
  }

  // Adjust nodes (2, 1) and (3, 1) specifically so dag 103 (c=2, r=0) has area ~1214.058 m² = 30.0 decimal
  // Cell 103 width is 40m. Height required = 1214.058 / 40 ≈ 30.3515 m.
  // r=0 is at yOrigin (-120). Row 1 y = -120 + 30.3515 = -89.6485.
  const targetH = 30.35145;
  nodes[2]![1]![0] = xOrigin + 2 * cellM;
  nodes[2]![1]![1] = yOrigin + targetH;
  nodes[3]![1]![0] = xOrigin + 3 * cellM;
  nodes[3]![1]![1] = yOrigin + targetH;

  // 3. Build Dags: 48 cells
  const dags: Feature<GeoPolygon, DagProps>[] = [];
  const allEvents: LandEvent[] = [];

  // Assign land classes to cells
  // Row 0 (dags 101-108): bastu / vita (except 103, 107, 108 scenario classes)
  // Rows 1-3: vita / nal / bastu
  // Rows 4-5: nal, two doba cells
  const scenarioClasses: Record<string, LandClass> = {
    '101': 'vita',
    '102': 'vita',
    '103': 'nal',
    '104': 'vita',
    '105': 'vita',
    '106': 'vita',
    '107': 'nal',
    '108': 'nal',
    '109': 'vita',
    '110': 'nal',
    '111': 'vita',
    '112': 'nal',
  };

  // Pre-designate classes for 113-148
  // We need bastu to have >= 6 plots so we can generate >= 6 sales in 24 months
  // Doba has exactly 2 cells (say 147 and 148)
  const landClassDistribution: LandClass[] = [
    // Row 1 (113-116)
    'bastu',
    'bastu',
    'bastu',
    'vita',
    // Row 2 (117-124)
    'bastu',
    'bastu',
    'bastu',
    'bastu',
    'vita',
    'vita',
    'nal',
    'nal',
    // Row 3 (125-132)
    'vita',
    'vita',
    'vita',
    'vita',
    'nal',
    'nal',
    'nal',
    'nal',
    // Row 4 (133-140)
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    // Row 5 (141-148)
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    'nal',
    'doba',
    'doba',
  ];

  let normalClassIdx = 0;

  // First pass: create geometry and dag properties
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idNum = 101 + r * cols + c;
      const id = String(idNum);

      // Node corners
      const blM = nodes[c]![r]!;
      const brM = nodes[c + 1]![r]!;
      const trM = nodes[c + 1]![r + 1]!;
      const tlM = nodes[c]![r + 1]!;

      // Convert to [lng, lat]
      const bl = metersToCoord(blM[0], blM[1]);
      const br = metersToCoord(brM[0], brM[1]);
      const tr = metersToCoord(trM[0], trM[1]);
      const tl = metersToCoord(tlM[0], tlM[1]);

      const polyCoordinates: number[][][] = [[bl, br, tr, tl, bl]];

      const polyGeo: GeoPolygon = {
        type: 'Polygon',
        coordinates: polyCoordinates,
      };

      const polyFeature = {
        type: 'Feature' as const,
        geometry: polyGeo,
        properties: {},
      };

      const polyAreaM2 = area(polyFeature);
      let recordedAreaDecimal = Math.round((polyAreaM2 / 40.4686) * 2) / 2;

      if (id === '103') {
        recordedAreaDecimal = 30.0;
      }

      // Survey numbers
      const csIndex = r * 4 + Math.floor(c / 2) + 1;
      const dagNo = {
        CS: String(csIndex),
        SA: String(csIndex),
        RS: String(200 + (idNum - 100)),
        BS: id,
      };

      let landClass: LandClass;
      if (scenarioClasses[id]) {
        landClass = scenarioClasses[id]!;
      } else {
        landClass = landClassDistribution[normalClassIdx++] ?? 'nal';
      }

      const roadFacing = r === 0;
      const flags: DagProps['flags'] = {};
      if (id === '108') {
        flags.khas = true;
      }

      dags.push({
        type: 'Feature',
        geometry: polyGeo,
        id,
        properties: {
          id,
          mouzaId: 'notun-char',
          dagNo,
          landClass,
          recordedAreaDecimal,
          roadFacing,
          flags,
        },
      });
    }
  }

  // 4. Area mismatch demo for phase 5:
  // "For 3 random non-scenario dags, change the recorded area by +8–12% (area-mismatch demo for phase 5)."
  const nonScenarioDags = dags.filter((d) => Number(d.properties.id) >= 113);
  const mismatchDag1 = rng.pick(nonScenarioDags);
  const remaining1 = nonScenarioDags.filter((d) => d.properties.id !== mismatchDag1.properties.id);
  const mismatchDag2 = rng.pick(remaining1);
  const remaining2 = remaining1.filter((d) => d.properties.id !== mismatchDag2.properties.id);
  const mismatchDag3 = rng.pick(remaining2);

  for (const md of [mismatchDag1, mismatchDag2, mismatchDag3]) {
    const mult = 1 + 0.08 + rng.next() * 0.04; // +8% to +12%
    md.properties.recordedAreaDecimal =
      Math.round(md.properties.recordedAreaDecimal * mult * 2) / 2;
  }

  // 5. Build histories for each dag
  let deedSeq = 1;
  let mutationSeq = 1;

  for (const dag of dags) {
    const dagId = dag.properties.id;

    if (Number(dagId) <= 112) {
      // Hand-built scenario history
      const scEvents = getScenarioEvents(dagId);
      allEvents.push(...scEvents);
      continue;
    }

    // Normal clean dag history (DATA.md §4.7)
    // CS 1932: 1 owner 1/1
    const pCs = rng.pick(normalPeoplePool);
    const evCs: RecordEvent = {
      id: `ev-${dagId}-cs`,
      dagId,
      date: '1932-02-15',
      type: 'record',
      survey: 'CS',
      khatianNo: `CS-${dag.properties.dagNo.CS}`,
      holdings: [{ personId: pCs.id, share: '1/1' }],
    };

    // SA 1962: 1 owner 1/1
    const pSa = rng.chance(0.5) ? pCs : rng.pick(normalPeoplePool);
    const evSa: RecordEvent = {
      id: `ev-${dagId}-sa`,
      dagId,
      date: '1962-04-10',
      type: 'record',
      survey: 'SA',
      khatianNo: `SA-${dag.properties.dagNo.SA}`,
      holdings: [{ personId: pSa.id, share: '1/1' }],
    };

    // RS 1987: 1-2 owners
    let rsHoldings: Holding[];
    const pRs1 = rng.pick(normalPeoplePool);
    if (rng.chance(0.7)) {
      rsHoldings = [{ personId: pRs1.id, share: '1/1' }];
    } else {
      let pRs2 = rng.pick(normalPeoplePool);
      while (pRs2.id === pRs1.id) pRs2 = rng.pick(normalPeoplePool);
      rsHoldings = [
        { personId: pRs1.id, share: '1/2' },
        { personId: pRs2.id, share: '1/2' },
      ];
    }
    const evRs: RecordEvent = {
      id: `ev-${dagId}-rs`,
      dagId,
      date: '1987-11-20',
      type: 'record',
      survey: 'RS',
      khatianNo: `RS-${dag.properties.dagNo.RS}`,
      holdings: rsHoldings,
    };

    // BS 2011: 1-3 owners
    let bsHoldings: Holding[];
    const pBs1 = rng.pick(normalPeoplePool);
    const bsSplit = rng.next();
    if (bsSplit < 0.6) {
      bsHoldings = [{ personId: pBs1.id, share: '1/1' }];
    } else if (bsSplit < 0.85) {
      let pBs2 = rng.pick(normalPeoplePool);
      while (pBs2.id === pBs1.id) pBs2 = rng.pick(normalPeoplePool);
      bsHoldings = [
        { personId: pBs1.id, share: '1/2' },
        { personId: pBs2.id, share: '1/2' },
      ];
    } else {
      let pBs2 = rng.pick(normalPeoplePool);
      while (pBs2.id === pBs1.id) pBs2 = rng.pick(normalPeoplePool);
      let pBs3 = rng.pick(normalPeoplePool);
      while (pBs3.id === pBs1.id || pBs3.id === pBs2.id) pBs3 = rng.pick(normalPeoplePool);
      bsHoldings = [
        { personId: pBs1.id, share: '1/2' },
        { personId: pBs2.id, share: '1/4' },
        { personId: pBs3.id, share: '1/4' },
      ];
    }
    const evBs: RecordEvent = {
      id: `ev-${dagId}-bs`,
      dagId,
      date: '2011-06-15',
      type: 'record',
      survey: 'BS',
      khatianNo: `BS-${dagId}`,
      holdings: bsHoldings,
    };

    allEvents.push(evCs, evSa, evRs, evBs);

    // Sales between 2013 and 2026-07 (0 to 2 sales)
    let currentHoldings = [...bsHoldings];

    // Determine number of sales:
    // Doba cells have 0 sales to maintain insufficient data path for doba
    let numSales = 0;
    if (dag.properties.landClass !== 'doba') {
      const salesRoll = rng.next();
      numSales = salesRoll < 0.3 ? 0 : salesRoll < 0.75 ? 1 : 2;
    }

    let lastEventDate = '2011-06-15';

    for (let s = 0; s < numSales; s++) {
      if (currentHoldings.length === 0) break;
      const sellerHolding = currentHoldings[0]!;
      let buyer = rng.pick(normalPeoplePool);
      while (currentHoldings.some((h) => h.personId === buyer.id)) {
        buyer = rng.pick(normalPeoplePool);
      }

      // Schedule sale date
      let saleDate: string;
      if (s === 0 && numSales === 2) {
        // First sale in 2015-2020
        const year = 2015 + rng.int(0, 5);
        const month = String(rng.int(1, 12)).padStart(2, '0');
        const day = String(rng.int(1, 28)).padStart(2, '0');
        saleDate = `${year}-${month}-${day}`;
      } else {
        // Recent sale in 2024-2026 (for price comps coverage)
        const is2026 = rng.chance(0.6);
        const year = is2026 ? 2026 : 2025;
        const month = is2026 ? rng.int(1, 7) : rng.int(1, 12);
        const day = rng.int(1, 28);
        saleDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      if (saleDate <= lastEventDate) {
        saleDate = addDays(lastEventDate, 30);
      }
      if (saleDate > '2026-07-28') {
        saleDate = '2026-07-20';
      }

      const deedNo = `D-${saleDate.slice(0, 4)}-${dagId}-${deedSeq++}`;

      // Calculate declared price (DATA.md §4.8)
      const baseRate = BASE_PRICES_2026[dag.properties.landClass];
      const roadMult = dag.properties.roadFacing ? 1.15 : 1.0;
      const randMult = 0.85 + rng.next() * 0.3;
      const saleYear = Number(saleDate.slice(0, 4));
      const yearDiscount = Math.pow(1.08, Math.max(0, 2026 - saleYear));
      const ratePerDecimal = Math.round((baseRate * roadMult * randMult) / yearDiscount);
      const frac = new Fraction(sellerHolding.share);
      const soldDecimal = (dag.properties.recordedAreaDecimal * Number(frac.n)) / Number(frac.d);

      let declaredPrice = Math.round(ratePerDecimal * soldDecimal);
      // In 10% of deeds before 2023-10-01, declare 30-40%
      if (saleDate < '2023-10-01' && rng.chance(0.1)) {
        declaredPrice = Math.round(declaredPrice * (0.3 + rng.next() * 0.1));
      }

      const evDeed: DeedEvent = {
        id: `ev-${dagId}-d${s + 1}`,
        dagId,
        date: saleDate,
        type: 'deed',
        deedNo,
        kind: 'sale',
        sellers: [{ personId: sellerHolding.personId, share: sellerHolding.share }],
        buyers: [{ personId: buyer.id, share: sellerHolding.share }],
        declaredPriceBdt: declaredPrice,
        subRegistryBn: 'মানিকগঞ্জ সদর',
      };

      // Mutation 15-60 days later
      const mutDays = rng.int(15, 60);
      const mutDate = addDays(saleDate, mutDays);
      const caseNo = `M-${saleDate.slice(0, 4)}-${dagId}-${mutationSeq++}`;

      currentHoldings = [
        ...currentHoldings.slice(1),
        { personId: buyer.id, share: sellerHolding.share },
      ];

      const evMut: MutationEvent = {
        id: `ev-${dagId}-m${s + 1}`,
        dagId,
        date: mutDate,
        type: 'mutation',
        caseNo,
        refDeedNo: deedNo,
        holdingsAfter: currentHoldings,
      };

      allEvents.push(evDeed, evMut);
      lastEventDate = mutDate;
    }

    // Land tax up to 2026, arrears 0
    allEvents.push({
      id: `ev-${dagId}-tax`,
      dagId,
      date: '2026-02-15',
      type: 'landTax',
      paidUpToYear: 2026,
      arrearsBdt: 0,
    });
  }

  // 6. Coverage guarantee verification and adjustment:
  // "for every land class that appears, at least 6 sales dated within 24 months before DEMO_TODAY"
  // Check bastu, vita, nal
  const recentCutoff = '2024-10-01';
  const commonClasses: LandClass[] = ['bastu', 'vita', 'nal'];

  for (const lc of commonClasses) {
    const countRecentSales = () => {
      let count = 0;
      for (const ev of allEvents) {
        if (ev.type === 'deed' && ev.kind === 'sale' && ev.date >= recentCutoff) {
          const dag = dags.find((d) => d.properties.id === ev.dagId);
          if (dag && dag.properties.landClass === lc) {
            count++;
          }
        }
      }
      return count;
    };

    let salesCount = countRecentSales();
    if (salesCount < 6) {
      // Add extra clean sales to normal dags of this class
      const candidateDags = dags.filter(
        (d) => Number(d.properties.id) >= 113 && d.properties.landClass === lc,
      );

      for (const cand of candidateDags) {
        if (salesCount >= 6) break;
        // Check if candidate already has a recent sale
        const hasRecent = allEvents.some(
          (ev) => ev.dagId === cand.properties.id && ev.type === 'deed' && ev.date >= recentCutoff,
        );
        if (hasRecent) continue;

        // Add a sale in 2025-06
        const dagId = cand.properties.id;
        const bsRecord = allEvents.find(
          (ev) => ev.dagId === dagId && ev.type === 'record' && (ev as RecordEvent).survey === 'BS',
        ) as RecordEvent;
        if (!bsRecord || bsRecord.holdings.length === 0) continue;

        const seller = bsRecord.holdings[0]!;
        let buyer = rng.pick(normalPeoplePool);
        while (buyer.id === seller.personId) buyer = rng.pick(normalPeoplePool);

        const saleDate = '2025-06-15';
        const deedNo = `D-2025-${dagId}-cov-${deedSeq++}`;
        const baseRate = BASE_PRICES_2026[lc];
        const roadMult = cand.properties.roadFacing ? 1.15 : 1.0;
        const ratePerDecimal = Math.round((baseRate * roadMult) / 1.08);
        const frac = new Fraction(seller.share);
        const soldDecimal = (cand.properties.recordedAreaDecimal * Number(frac.n)) / Number(frac.d);
        const declaredPrice = Math.round(ratePerDecimal * soldDecimal);

        const evDeed: DeedEvent = {
          id: `ev-${dagId}-cov-deed`,
          dagId,
          date: saleDate,
          type: 'deed',
          deedNo,
          kind: 'sale',
          sellers: [{ personId: seller.personId, share: seller.share }],
          buyers: [{ personId: buyer.id, share: seller.share }],
          declaredPriceBdt: declaredPrice,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        };

        const evMut: MutationEvent = {
          id: `ev-${dagId}-cov-mut`,
          dagId,
          date: '2025-07-20',
          type: 'mutation',
          caseNo: `M-2025-${dagId}-cov-${mutationSeq++}`,
          refDeedNo: deedNo,
          holdingsAfter: [
            ...bsRecord.holdings.slice(1),
            { personId: buyer.id, share: seller.share },
          ],
        };

        allEvents.push(evDeed, evMut);
        salesCount++;
      }
    }
  }

  // 7. Sort events: by numeric dagId, then date, then id (DATA.md §2)
  allEvents.sort((a, b) => {
    const dDiff = Number(a.dagId) - Number(b.dagId);
    if (dDiff !== 0) return dDiff;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.id.localeCompare(b.id);
  });

  // 8. Mouza Object
  // Calculate bounding box of all nodes
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (let c = 0; c <= cols; c++) {
    for (let r = 0; r <= rows; r++) {
      const coord = metersToCoord(nodes[c]![r]![0], nodes[c]![r]![1]);
      if (coord[0] < minLng) minLng = coord[0];
      if (coord[0] > maxLng) maxLng = coord[0];
      if (coord[1] < minLat) minLat = coord[1];
      if (coord[1] > maxLat) maxLat = coord[1];
    }
  }

  // 8m margin for sheetCorners (DATA.md §3, §4.2)
  const margin8Lat = 8 * mToLat;
  const margin8Lng = 8 * mToLng;

  const sheetCorners: [[number, number], [number, number], [number, number], [number, number]] = [
    [minLng - margin8Lng, maxLat + margin8Lat], // TL
    [maxLng + margin8Lng, maxLat + margin8Lat], // TR
    [maxLng + margin8Lng, minLat - margin8Lat], // BR
    [minLng - margin8Lng, minLat - margin8Lat], // BL
  ];

  // Road line just south of row 0
  const roadLat = metersToCoord(0, yOrigin - 4)[1];
  const roadLine: Mouza['roadLine'] = {
    type: 'LineString',
    coordinates: [
      [minLng - margin8Lng, roadLat],
      [maxLng + margin8Lng, roadLat],
    ],
  };

  const mouza: Mouza = {
    id: 'notun-char',
    nameBn: 'নতুন চর',
    nameEn: 'Notun Char',
    jlNo: '০০০',
    upazilaBn: 'মানিকগঞ্জ সদর',
    upazilaEn: 'Manikganj Sadar',
    districtBn: 'মানিকগঞ্জ',
    districtEn: 'Manikganj',
    areaClass: 'union',
    sourceTaxClass: 'B',
    center: MOUZA_CENTER,
    bbox: [minLng, minLat, maxLng, maxLat],
    sheetCorners,
    roadLine,
  };

  const dagsGeojson: FeatureCollection<GeoPolygon, DagProps> = {
    type: 'FeatureCollection',
    features: dags,
  };

  // 9. Validation (DATA.md §4.10)
  validateGeneratedData({
    mouza,
    dags: dagsGeojson,
    people,
    events: allEvents,
    scenarios: SCENARIOS,
    feeRules: FEE_RULES,
  });

  // 10. Write output files to public/data/
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'mouza.json'), JSON.stringify(mouza, null, 2) + '\n');
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'dags.geojson'),
    JSON.stringify(dagsGeojson, null, 2) + '\n',
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, 'people.json'), JSON.stringify(people, null, 2) + '\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'events.json'), JSON.stringify(allEvents, null, 2) + '\n');
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'scenarios.json'),
    JSON.stringify(SCENARIOS, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'feeRules.json'),
    JSON.stringify(FEE_RULES, null, 2) + '\n',
  );

  console.log(`Successfully generated demo mouza data in ${OUTPUT_DIR}:`);
  console.log(`  - 48 Dags (101-148)`);
  console.log(`  - ${people.length} People`);
  console.log(`  - ${allEvents.length} Land Events`);
  console.log(`  - ${SCENARIOS.length} Scenarios`);
  console.log(`  - Fee rules and Mouza metadata`);
}

/**
 * Validates all invariants per DATA.md §4.10
 */
export function validateGeneratedData(data: {
  mouza: Mouza;
  dags: FeatureCollection<GeoPolygon, DagProps>;
  people: Person[];
  events: LandEvent[];
  scenarios: typeof SCENARIOS;
  feeRules: FeeRules;
}) {
  const personIds = new Set(data.people.map((p) => p.id));
  const dagIds = new Set(data.dags.features.map((f) => f.properties.id));

  // 48 dags with IDs 101 to 148
  if (data.dags.features.length !== 48) {
    throw new Error(`Expected exactly 48 dags, found ${data.dags.features.length}`);
  }
  for (let i = 101; i <= 148; i++) {
    if (!dagIds.has(String(i))) {
      throw new Error(`Missing expected dag ID: ${i}`);
    }
  }

  // 12 scenarios present
  if (data.scenarios.length !== 12) {
    throw new Error(`Expected exactly 12 scenarios, found ${data.scenarios.length}`);
  }
  for (const sc of data.scenarios) {
    if (!dagIds.has(sc.dagId)) {
      throw new Error(`Scenario dag ${sc.dagId} does not exist in dags`);
    }
  }

  // Validate events
  let prevDag = -1;
  let prevDate = '';
  let prevId = '';

  for (const ev of data.events) {
    if (!dagIds.has(ev.dagId)) {
      throw new Error(`Event ${ev.id} references non-existent dag ${ev.dagId}`);
    }
    if (ev.date > DEMO_TODAY) {
      throw new Error(`Event ${ev.id} date ${ev.date} is after DEMO_TODAY (${DEMO_TODAY})`);
    }

    // Check sorting
    const numDag = Number(ev.dagId);
    if (numDag < prevDag) {
      throw new Error(`Events not sorted by dagId: ${ev.dagId} after ${prevDag}`);
    } else if (numDag === prevDag) {
      if (ev.date < prevDate) {
        throw new Error(`Events for dag ${ev.dagId} not sorted by date: ${ev.date} < ${prevDate}`);
      } else if (ev.date === prevDate && ev.id < prevId) {
        throw new Error(`Events on ${ev.date} not sorted by id: ${ev.id} < ${prevId}`);
      }
    }
    prevDag = numDag;
    prevDate = ev.date;
    prevId = ev.id;

    // Check event-specific rules
    if (ev.type === 'record') {
      let sum = new Fraction(0);
      for (const h of ev.holdings) {
        if (!personIds.has(h.personId)) {
          throw new Error(`Record event ${ev.id} references unknown person ${h.personId}`);
        }
        sum = sum.add(new Fraction(h.share));
      }
      if (!sum.equals(1)) {
        throw new Error(
          `Record event ${ev.id} holdings do not sum to 1 (sum = ${sum.toFraction()})`,
        );
      }
    } else if (ev.type === 'mutation') {
      let sum = new Fraction(0);
      for (const h of ev.holdingsAfter) {
        if (!personIds.has(h.personId)) {
          throw new Error(`Mutation event ${ev.id} references unknown person ${h.personId}`);
        }
        sum = sum.add(new Fraction(h.share));
      }
      if (!sum.equals(1)) {
        throw new Error(
          `Mutation event ${ev.id} holdings do not sum to 1 (sum = ${sum.toFraction()})`,
        );
      }
    } else if (ev.type === 'deed') {
      let sellerSum = new Fraction(0);
      for (const s of ev.sellers) {
        if (!personIds.has(s.personId)) {
          throw new Error(`Deed event ${ev.id} references unknown seller ${s.personId}`);
        }
        sellerSum = sellerSum.add(new Fraction(s.share));
      }
      let buyerSum = new Fraction(0);
      for (const b of ev.buyers) {
        if (!personIds.has(b.personId)) {
          throw new Error(`Deed event ${ev.id} references unknown buyer ${b.personId}`);
        }
        buyerSum = buyerSum.add(new Fraction(b.share));
      }
      if (!sellerSum.equals(buyerSum)) {
        throw new Error(
          `Deed event ${ev.id} sellers (${sellerSum.toFraction()}) != buyers (${buyerSum.toFraction()})`,
        );
      }
    } else if (ev.type === 'inheritance') {
      if (!personIds.has(ev.deceasedId)) {
        throw new Error(`Inheritance event ${ev.id} references unknown deceased ${ev.deceasedId}`);
      }
      for (const h of ev.heirs) {
        if (!personIds.has(h.personId)) {
          throw new Error(`Inheritance event ${ev.id} references unknown heir ${h.personId}`);
        }
      }
    }
  }

  // No phone / NID fields in people
  for (const p of data.people) {
    const raw = p as Record<string, unknown>;
    if ('phone' in raw || 'nid' in raw || 'nidNumber' in raw || 'address' in raw) {
      throw new Error(`Privacy violation: person ${p.id} contains phone/nid/address field!`);
    }
  }
}

// When executed directly via `tsx scripts/generate-data.ts`
if (process.argv[1]?.includes('generate-data')) {
  generateData();
}
