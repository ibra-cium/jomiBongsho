/**
 * Jomi Bongsho Domain Engine Types
 * Pure TypeScript definitions adhering to DATA.md and DOMAIN_RULES.md
 */

export type Share = string; // fraction of the WHOLE dag as "a/b", e.g. "7/20"
export type SurveyKind = 'CS' | 'SA' | 'RS' | 'BS';
export type LandClass = 'nal' | 'vita' | 'bastu' | 'doba';
export type AreaClass = 'union' | 'pourashava' | 'city';
export type SourceTaxClass = 'A' | 'B' | 'C';
export type Relation =
  'wife' | 'husband' | 'son' | 'daughter' | 'father' | 'mother' | 'brother' | 'sister';

export interface Mouza {
  id: string;
  nameBn: string;
  nameEn: string;
  jlNo: string;
  upazilaBn: string;
  upazilaEn: string;
  districtBn: string;
  districtEn: string;
  areaClass: AreaClass;
  sourceTaxClass: SourceTaxClass;
  center: [number, number];
  bbox: [number, number, number, number]; // [west, south, east, north]
  sheetCorners: [[number, number], [number, number], [number, number], [number, number]]; // TL, TR, BR, BL
  roadLine?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface DagProps {
  id: string; // BS dag number, e.g. "101"
  mouzaId: string;
  dagNo: Partial<Record<SurveyKind, string>>; // dag number in each survey
  landClass: LandClass;
  recordedAreaDecimal: number; // area in the latest khatian
  roadFacing: boolean;
  flags: {
    khas?: boolean;
    acquisition?: boolean;
    erosionRisk?: boolean;
  };
}

export interface Person {
  id: string;
  nameBn: string;
  nameEn: string;
  sex: 'M' | 'F';
}

export interface Holding {
  personId: string;
  share: Share;
}

interface EventBase {
  id: string;
  dagId: string;
  date: string; // ISO date 'YYYY-MM-DD'
}

export interface RecordEvent extends EventBase {
  type: 'record';
  survey: SurveyKind;
  khatianNo: string;
  holdings: Holding[];
}

export interface DeedEvent extends EventBase {
  type: 'deed';
  deedNo: string;
  kind: 'sale' | 'gift';
  sellers: Holding[]; // share each seller transfers (of the whole dag)
  buyers: Holding[]; // share each buyer receives; sum(buyers) === sum(sellers)
  declaredPriceBdt: number; // integer taka written in the deed (0 for gifts)
  subRegistryBn: string;
}

export interface MutationEvent extends EventBase {
  type: 'mutation';
  caseNo: string;
  refDeedNo: string | null;
  holdingsAfter: Holding[];
}

export interface InheritanceEvent extends EventBase {
  type: 'inheritance';
  deceasedId: string;
  law: 'muslim' | 'hindu';
  heirs: { personId: string; relation: Relation }[];
}

export interface CaseEvent extends EventBase {
  type: 'case';
  caseNo: string;
  courtBn: string;
  status: 'pending' | 'disposed';
}

export interface LandTaxEvent extends EventBase {
  type: 'landTax';
  paidUpToYear: number;
  arrearsBdt: number;
}

export type LandEvent =
  RecordEvent | DeedEvent | MutationEvent | InheritanceEvent | CaseEvent | LandTaxEvent;

export type Verdict = 'green' | 'yellow' | 'red';

export type IssueCode =
  | 'DOUBLE_SALE'
  | 'HEIR_OVER_SALE'
  | 'OVER_SALE'
  | 'CHAIN_BREAK'
  | 'MUTATION_WITHOUT_DEED'
  | 'RECORD_SUM_ERROR'
  | 'KHAS_LAND'
  | 'ACQUISITION'
  | 'PENDING_CASE'
  | 'MUTATION_MISMATCH'
  | 'ESTATE_LEGAL_REVIEW'
  | 'REG_WITHOUT_MUTATION'
  | 'RAPID_RESALE'
  | 'UNDER_DECLARED'
  | 'AREA_MISMATCH'
  | 'TAX_ARREARS';

export interface FaraizRow {
  personId: string;
  relation: Relation;
  share: Share;
  ruleKey: string;
}

export type FaraizUnsupportedReason =
  'NO_SON' | 'UNSUPPORTED_RELATION' | 'HINDU_LAW' | 'NO_HEIRS' | 'INVALID_SPOUSE';

export interface FaraizSupportedResult {
  supported: true;
  shares: FaraizRow[];
}

export interface FaraizUnsupportedResult {
  supported: false;
  reason: FaraizUnsupportedReason;
}

export type FaraizResult = FaraizSupportedResult | FaraizUnsupportedResult;

export interface FaraizInput {
  deceasedSex: 'M' | 'F';
  law?: 'muslim' | 'hindu' | string;
  heirs: { personId: string; relation: Relation | string }[];
}

export interface Issue {
  code: IssueCode;
  severity: 'critical' | 'warning' | 'info';
  eventIds: string[];
  params: Record<string, string | number>; // names, decimals, dates for text template
  faraizTable?: FaraizRow[]; // for HEIR_OVER_SALE
}

export interface Scenario {
  dagId: string;
  key: string;
  expected: Verdict;
  titleBn: string;
  titleEn: string;
  storyBn: string;
  storyEn: string;
}

export interface FeeSource {
  label: string;
  url: string;
}

export interface FeeRules {
  fiscalYear: string;
  status: string;
  sources: FeeSource[];
  bp: {
    stampDuty: number;
    registrationFee: number;
    localGovtTax: Record<AreaClass, number>;
    sourceTax: Record<SourceTaxClass, number>;
  };
  fixedFeesBdt: {
    eFee: number;
    nFee: number;
    courtFee: number;
    affidavitStamp: number;
  };
  mutationFeesBdt: {
    courtFee: number;
    noticeFee: number;
    recordCorrection: number;
    ledgerCopy: number;
  };
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Feature<G, P> {
  type: 'Feature';
  geometry: G;
  properties: P;
  id?: string | number;
}

export interface FeatureCollection<G, P> {
  type: 'FeatureCollection';
  features: Feature<G, P>[];
}

export interface DemoData {
  mouza: Mouza;
  dags: FeatureCollection<GeoPolygon, DagProps>;
  people: Person[];
  events: LandEvent[];
  scenarios: Scenario[];
  feeRules: FeeRules;
}
