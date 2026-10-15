import { fromBanglaDigits } from '@/lib/format';
import type { DagFeature } from '@/lib/geo';

export type SurveyType = 'CS' | 'SA' | 'RS' | 'BS';

export interface SearchResult {
  feature: DagFeature;
  dagId: string;
  matchedSurvey: SurveyType;
  matchedNumber: string;
  isExact: boolean;
}

/**
 * Normalizes query string by mapping Bangla survey abbreviations and digits
 */
export function normalizeSearchQuery(raw: string): {
  survey?: SurveyType;
  number?: string;
  cleanText: string;
} {
  let text = raw.trim();
  if (!text) return { cleanText: '' };

  // Map Bangla survey names to English acronyms
  text = text
    .replace(/সি\s*এস/gi, 'CS')
    .replace(/এস\s*এ/gi, 'SA')
    .replace(/আর\s*এস/gi, 'RS')
    .replace(/বি\s*এস/gi, 'BS');

  // Convert Bangla digits to standard ASCII digits
  text = fromBanglaDigits(text);

  // Check for survey prefix pattern like "CS 12", "CS12", "sa 1"
  const surveyMatch = text.match(/^(CS|SA|RS|BS)\s*(\d*)$/i);
  if (surveyMatch) {
    const survey = surveyMatch[1]!.toUpperCase() as SurveyType;
    const number = surveyMatch[2]?.trim();
    return { survey, number, cleanText: text };
  }

  // Pure digits or other text
  const digitsOnly = text.replace(/\D/g, '');
  return { number: digitsOnly || undefined, cleanText: text };
}

/**
 * Searches Dag features by dag number (Bengali/English) or older survey numbers (CS, SA, RS, BS)
 */
export function searchDags(query: string, features: DagFeature[]): SearchResult[] {
  if (!query || !features || features.length === 0) {
    return [];
  }

  const { survey, number } = normalizeSearchQuery(query);

  if (!survey && !number) {
    return [];
  }

  const results: SearchResult[] = [];

  // Case 1: Survey specified, e.g. "CS 12", "RS 201"
  if (survey) {
    for (const feature of features) {
      const surveyVal = feature.properties.dagNo?.[survey];
      if (!surveyVal) continue;

      if (!number) {
        // Query was just "CS" or "সিএস"
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: survey,
          matchedNumber: surveyVal,
          isExact: false,
        });
      } else if (surveyVal === number) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: survey,
          matchedNumber: surveyVal,
          isExact: true,
        });
      } else if (surveyVal.startsWith(number)) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: survey,
          matchedNumber: surveyVal,
          isExact: false,
        });
      }
    }

    // Sort exact matches first, then numerical dagId
    return results.sort((a, b) => {
      if (a.isExact !== b.isExact) return a.isExact ? -1 : 1;
      return Number(a.dagId) - Number(b.dagId);
    });
  }

  // Case 2: Only number provided (e.g. "101", "১০৩", "12")
  if (number) {
    for (const feature of features) {
      const bsVal = feature.properties.dagNo?.BS ?? feature.properties.id;
      const rsVal = feature.properties.dagNo?.RS;
      const saVal = feature.properties.dagNo?.SA;
      const csVal = feature.properties.dagNo?.CS;

      if (bsVal === number || feature.properties.id === number) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: 'BS',
          matchedNumber: bsVal,
          isExact: true,
        });
      } else if (bsVal.startsWith(number) || feature.properties.id.startsWith(number)) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: 'BS',
          matchedNumber: bsVal,
          isExact: false,
        });
      } else if (rsVal === number) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: 'RS',
          matchedNumber: rsVal,
          isExact: true,
        });
      } else if (saVal === number) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: 'SA',
          matchedNumber: saVal,
          isExact: true,
        });
      } else if (csVal === number) {
        results.push({
          feature,
          dagId: feature.properties.id,
          matchedSurvey: 'CS',
          matchedNumber: csVal,
          isExact: true,
        });
      }
    }

    return results.sort((a, b) => {
      // 1. Exact BS match first
      const aExactBs = a.isExact && a.matchedSurvey === 'BS';
      const bExactBs = b.isExact && b.matchedSurvey === 'BS';
      if (aExactBs !== bExactBs) return aExactBs ? -1 : 1;

      // 2. Any exact match
      if (a.isExact !== b.isExact) return a.isExact ? -1 : 1;

      // 3. BS matches before older surveys
      if (a.matchedSurvey === 'BS' && b.matchedSurvey !== 'BS') return -1;
      if (b.matchedSurvey === 'BS' && a.matchedSurvey !== 'BS') return 1;

      return Number(a.dagId) - Number(b.dagId);
    });
  }

  return [];
}
