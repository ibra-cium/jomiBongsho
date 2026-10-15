/**
 * Hand-Built Scenario Dags (101-112)
 * Adhering strictly to DATA.md §7 and DOMAIN_RULES.md
 */
import type { LandEvent, Person, Scenario } from '../src/engine/types';

export const SCENARIO_PEOPLE: Person[] = [
  // Dag 108 Special Person
  { id: 'p-govt', nameBn: 'বাংলাদেশ সরকার', nameEn: 'Government of Bangladesh', sex: 'M' },

  // Dag 101: Clean chain
  { id: 'p-101-cs', nameBn: 'রহমত উল্লাহ', nameEn: 'Rahmat Ullah', sex: 'M' },
  { id: 'p-101-sa', nameBn: 'বসির উদ্দিন', nameEn: 'Bashir Uddin', sex: 'M' },
  { id: 'p-karim', nameBn: 'করিম মিয়া', nameEn: 'Karim Mia', sex: 'M' },
  { id: 'p-rahim', nameBn: 'রহিম হোসেন', nameEn: 'Rahim Hossain', sex: 'M' },

  // Dag 102: Double sale
  { id: 'p-jalal', nameBn: 'জালাল উদ্দিন', nameEn: 'Jalal Uddin', sex: 'M' },
  { id: 'p-rokeya', nameBn: 'রোকেয়া বেগম', nameEn: 'Rokeya Begum', sex: 'F' },
  { id: 'p-buyer-a', nameBn: 'কামাল হোসেন', nameEn: 'Kamal Hossain', sex: 'M' },
  { id: 'p-buyer-b', nameBn: 'তারেক মাহমুদ', nameEn: 'Tarek Mahmud', sex: 'M' },

  // Dag 103: Heir over-sale
  { id: 'p-malek', nameBn: 'আব্দুল মালেক', nameEn: 'Abdul Malek', sex: 'M' },
  { id: 'p-rahima', nameBn: 'রহিমা বেগম', nameEn: 'Rahima Begum', sex: 'F' },
  { id: 'p-faruk', nameBn: 'ফারুক হোসেন', nameEn: 'Faruk Hossain', sex: 'M' },
  { id: 'p-selim', nameBn: 'সেলিম আহমেদ', nameEn: 'Selim Ahmed', sex: 'M' },
  { id: 'p-nasima', nameBn: 'নাসিমা আক্তার', nameEn: 'Nasima Akter', sex: 'F' },
  { id: 'p-buyer-c', nameBn: 'রফিকুল ইসলাম', nameEn: 'Rafiqul Islam', sex: 'M' },

  // Dag 104: Registration without mutation
  { id: 'p-104-seller', nameBn: 'শফিকুল ইসলাম', nameEn: 'Shafiqul Islam', sex: 'M' },
  { id: 'p-104-buyer', nameBn: 'জহিরুল হক', nameEn: 'Zahirul Haque', sex: 'M' },

  // Dag 105: Rapid resale
  { id: 'p-105-a', nameBn: 'কবির আহমেদ', nameEn: 'Kabir Ahmed', sex: 'M' },
  { id: 'p-105-b', nameBn: 'আনোয়ার হোসেন', nameEn: 'Anwar Hossain', sex: 'M' },
  { id: 'p-105-c', nameBn: 'সোহেল রানা', nameEn: 'Sohel Rana', sex: 'M' },
  { id: 'p-105-d', nameBn: 'মোস্তফা কামাল', nameEn: 'Mostafa Kamal', sex: 'M' },

  // Dag 106: Under-declared
  { id: 'p-106-seller', nameBn: 'হাবিবুর রহমান', nameEn: 'Habibur Rahman', sex: 'M' },
  { id: 'p-106-buyer', nameBn: 'নাজমুল হুদা', nameEn: 'Nazmul Huda', sex: 'M' },

  // Dag 107: Chain break
  { id: 'p-hasan', nameBn: 'হাসান আলী', nameEn: 'Hasan Ali', sex: 'M' },
  { id: 'p-mizan', nameBn: 'মিজানুর রহমান', nameEn: 'Mizanur Rahman', sex: 'M' },
  { id: 'p-buyer-e', nameBn: 'ফজলুল হক', nameEn: 'Fazlul Haque', sex: 'M' },

  // Dag 108: Khas land
  { id: 'p-108-fake-seller', nameBn: 'খলিলুর রহমান', nameEn: 'Khalilur Rahman', sex: 'M' },
  { id: 'p-108-victim', nameBn: 'আরিফ হোসেন', nameEn: 'Arif Hossain', sex: 'M' },

  // Dag 109: Pending case
  { id: 'p-109-owner', nameBn: 'মাহবুবুল আলম', nameEn: 'Mahbubul Alam', sex: 'M' },

  // Dag 110: Estate legal review (unsupported heirs)
  { id: 'p-110-deceased', nameBn: 'মতিউর রহমান', nameEn: 'Motiur Rahman', sex: 'M' },
  { id: 'p-110-d1', nameBn: 'মরিয়ম বেগম', nameEn: 'Marium Begum', sex: 'F' },
  { id: 'p-110-d2', nameBn: 'রেহানা পারভীন', nameEn: 'Rehana Parveen', sex: 'F' },
  { id: 'p-110-b1', nameBn: 'লতিফুর রহমান', nameEn: 'Latifur Rahman', sex: 'M' },

  // Dag 111: Mutation without deed
  { id: 'p-111-original', nameBn: 'স্বপন কুমার', nameEn: 'Swapan Kumar', sex: 'M' },
  { id: 'p-kamal', nameBn: 'কামাল শেখ', nameEn: 'Kamal Sheikh', sex: 'M' },

  // Dag 112: Tax arrears
  { id: 'p-112-owner', nameBn: 'বেলাল হোসেন', nameEn: 'Belal Hossain', sex: 'M' },
];

export const SCENARIOS: Scenario[] = [
  {
    dagId: '101',
    key: 'CLEAN_HISTORY',
    expected: 'green',
    titleBn: 'সম্পূর্ণ নির্ভুল ও পরিষ্কার মালিকানা',
    titleEn: 'Clean & Verified Ownership',
    storyBn:
      'সিএস থেকে বিএস পর্যন্ত ধারাবাহিক রেকর্ড, ক্রয়সূত্রে নামজারি এবং হালনাগাদ খাজনা পরিশোধিত।',
    storyEn:
      'Continuous records from CS to BS, mutated purchase deed, and up-to-date land development tax.',
  },
  {
    dagId: '102',
    key: 'DOUBLE_SALE',
    expected: 'red',
    titleBn: 'একই জমি দুইবার বিক্রি',
    titleEn: 'Same Land Sold Twice',
    storyBn:
      'জালাল তার সম্পূর্ণ ১০ শতাংশ জমি প্রথম ক্রেতার কাছে বিক্রির পর পুনরায় দ্বিতীয় ক্রেতার কাছে বিক্রি করেছেন।',
    storyEn:
      'Jalal sold his entire 10 decimal share to Buyer A, then sold the same land again to Buyer B.',
  },
  {
    dagId: '103',
    key: 'HEIR_OVER_SALE',
    expected: 'red',
    titleBn: 'ওয়ারিশ তার অংশের বেশি বিক্রি করছেন',
    titleEn: 'Heir Selling More Than Their Share',
    storyBn:
      'আব্দুল মালেকের মৃত্যুর পর ফারুকের ফারায়েজ অংশ ১০.৫ শতাংশ, কিন্তু তিনি ১৫ শতাংশ বিক্রি করছেন।',
    storyEn:
      "After Abdul Malek's death, Faruk's faraiz share is 10.5 decimal, but he is selling 15 decimal.",
  },
  {
    dagId: '104',
    key: 'REG_WITHOUT_MUTATION',
    expected: 'yellow',
    titleBn: 'দলিল হয়েছে কিন্তু নামজারি হয়নি',
    titleEn: 'Registered Deed Without Mutation',
    storyBn:
      '২০২৫ সালের ডিসেম্বরে জমি বিক্রি হলেও ৯ মাসের বেশি সময় ধরে কোনো নামজারি সম্পন্ন করা হয়নি।',
    storyEn:
      'Land was sold in December 2025, but no mutation was completed after more than 9 months.',
  },
  {
    dagId: '105',
    key: 'RAPID_RESALE',
    expected: 'yellow',
    titleBn: 'অল্প সময়ে বারবার হাতবদল',
    titleEn: 'Rapid Successive Reselling',
    storyBn:
      '২০২৬ সালের ৫ মাসের মধ্যে জমিটি ৩ বার হাতবদল হয়েছে, যা কৃত্রিম মূল্যবৃদ্ধির সন্দেহ তৈরি করে।',
    storyEn:
      'The plot changed hands 3 times within 5 months in 2026, raising speculation concerns.',
  },
  {
    dagId: '106',
    key: 'UNDER_DECLARED',
    expected: 'yellow',
    titleBn: 'দলিলে বাজারমূল্যের চেয়ে অনেক কম দাম',
    titleEn: 'Under-Declared Deed Price',
    storyBn:
      'এলাকার গড় বাজারমূল্য ৪,৩০,০০০ টাকা হলেও দলিলে মাত্র ১,২০,০০০ টাকা উল্লেখ করা হয়েছে।',
    storyEn:
      'Market value is ~Tk 430,000/dec, but the deed declared only Tk 120,000/dec to evade taxes.',
  },
  {
    dagId: '107',
    key: 'CHAIN_BREAK',
    expected: 'red',
    titleBn: 'বিক্রেতা কখনো মালিক ছিলেন না',
    titleEn: 'Chain of Title Broken',
    storyBn:
      'খতিয়ান অনুযায়ী জমির মালিক হাসান, কিন্তু মিজান নিজেকে মালিক দাবি করে জমি বিক্রি করেছেন।',
    storyEn: 'Khatian owner is Hasan, but Mizan, who has no title history, sold the land.',
  },
  {
    dagId: '108',
    key: 'KHAS_LAND',
    expected: 'red',
    titleBn: 'সরকারি খাস জমি ব্যক্তিগত বিক্রি',
    titleEn: 'Government Khas Land',
    storyBn:
      'এটি বাংলাদেশ সরকারের মালিকানাধীন ১ নং খাস খতিয়ানের জমি, যা অবৈধভাবে বিক্রির চেষ্টা করা হয়েছে।',
    storyEn: 'This plot belongs to Government Khas Khatian No. 1 and cannot be privately sold.',
  },
  {
    dagId: '109',
    key: 'PENDING_CASE',
    expected: 'red',
    titleBn: 'আদালতে দেওয়ানি মামলা চলমান',
    titleEn: 'Pending Court Dispute',
    storyBn: 'জমিটির স্বত্ব নিয়ে সহকারী জজ আদালতে দেওয়ানি মামলা চলমান রয়েছে।',
    storyEn:
      'A title declaration suit regarding this land is pending in the Assistant Judge Court.',
  },
  {
    dagId: '110',
    key: 'ESTATE_LEGAL_REVIEW',
    expected: 'yellow',
    titleBn: 'ওয়ারিশ বণ্টন আইনি পর্যালোচনা প্রয়োজন',
    titleEn: 'Inheritance Requires Legal Review',
    storyBn:
      'মৃত ব্যক্তির ওয়ারিশ হিসেবে ২ কন্যা ও ১ ভাই রয়েছেন, যা বিশেষ ফারায়েজ নিয়মের আওতাভুক্ত।',
    storyEn:
      'Deceased left 2 daughters and a brother, requiring legal review under complex faraiz rules.',
  },
  {
    dagId: '111',
    key: 'MUTATION_WITHOUT_DEED',
    expected: 'red',
    titleBn: 'ভুয়া দলিল নম্বর দিয়ে নামজারি',
    titleEn: 'Mutation Without Valid Deed',
    storyBn:
      'নামজারি খতিয়ানে যে দলিল নম্বর দেখানো হয়েছে, সাব-রেজিস্ট্রি অফিসে তার কোনো অস্তিত্ব নেই।',
    storyEn:
      'The deed referenced in the mutation record does not exist in the sub-registry office.',
  },
  {
    dagId: '112',
    key: 'TAX_ARREARS',
    expected: 'green',
    titleBn: 'মালিকানা সঠিক কিন্তু ভূমি উন্নয়ন কর বকেয়া',
    titleEn: 'Valid Title With Tax Arrears',
    storyBn:
      'মালিকানার ধারাবাহিকতা সঠিক হলেও ২০২২ সালের পর থেকে ১৮,৫০০ টাকা ভূমি কর বকেয়া রয়েছে।',
    storyEn:
      'Ownership chain is clean, but Tk 18,500 in land development tax has been overdue since 2022.',
  },
];

export function getScenarioEvents(dagId: string): LandEvent[] {
  switch (dagId) {
    case '101':
      return [
        {
          id: 'ev-101-1',
          dagId: '101',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-01',
          holdings: [{ personId: 'p-101-cs', share: '1/1' }],
        },
        {
          id: 'ev-101-2',
          dagId: '101',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-01',
          holdings: [{ personId: 'p-101-sa', share: '1/1' }],
        },
        {
          id: 'ev-101-3',
          dagId: '101',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-201',
          holdings: [{ personId: 'p-karim', share: '1/1' }],
        },
        {
          id: 'ev-101-4',
          dagId: '101',
          date: '2011-04-12',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-101',
          holdings: [{ personId: 'p-karim', share: '1/1' }],
        },
        {
          id: 'ev-101-5',
          dagId: '101',
          date: '2019-03-15',
          type: 'deed',
          deedNo: 'D-2019-101',
          kind: 'sale',
          sellers: [{ personId: 'p-karim', share: '1/1' }],
          buyers: [{ personId: 'p-rahim', share: '1/1' }],
          declaredPriceBdt: 8655000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-101-6',
          dagId: '101',
          date: '2019-04-20',
          type: 'mutation',
          caseNo: 'M-2019-101',
          refDeedNo: 'D-2019-101',
          holdingsAfter: [{ personId: 'p-rahim', share: '1/1' }],
        },
        {
          id: 'ev-101-7',
          dagId: '101',
          date: '2026-02-10',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '102':
      return [
        {
          id: 'ev-102-1',
          dagId: '102',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-01',
          holdings: [{ personId: 'p-101-cs', share: '1/1' }],
        },
        {
          id: 'ev-102-2',
          dagId: '102',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-01',
          holdings: [{ personId: 'p-101-sa', share: '1/1' }],
        },
        {
          id: 'ev-102-3',
          dagId: '102',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-202',
          holdings: [
            { personId: 'p-jalal', share: '1/2' },
            { personId: 'p-rokeya', share: '1/2' },
          ],
        },
        {
          id: 'ev-102-4',
          dagId: '102',
          date: '2011-06-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-102',
          holdings: [
            { personId: 'p-jalal', share: '1/2' },
            { personId: 'p-rokeya', share: '1/2' },
          ],
        },
        {
          id: 'ev-102-5',
          dagId: '102',
          date: '2025-01-15',
          type: 'deed',
          deedNo: 'D-2025-102A',
          kind: 'sale',
          sellers: [{ personId: 'p-jalal', share: '1/2' }],
          buyers: [{ personId: 'p-buyer-a', share: '1/2' }],
          declaredPriceBdt: 4578000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-102-6',
          dagId: '102',
          date: '2025-02-20',
          type: 'mutation',
          caseNo: 'M-2025-102A',
          refDeedNo: 'D-2025-102A',
          holdingsAfter: [
            { personId: 'p-buyer-a', share: '1/2' },
            { personId: 'p-rokeya', share: '1/2' },
          ],
        },
        {
          id: 'ev-102-7',
          dagId: '102',
          date: '2026-07-10',
          type: 'deed',
          deedNo: 'D-2026-102B',
          kind: 'sale',
          sellers: [{ personId: 'p-jalal', share: '1/2' }],
          buyers: [{ personId: 'p-buyer-b', share: '1/2' }],
          declaredPriceBdt: 4945000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-102-8',
          dagId: '102',
          date: '2026-01-15',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '103':
      return [
        {
          id: 'ev-103-1',
          dagId: '103',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-02',
          holdings: [{ personId: 'p-malek', share: '1/1' }],
        },
        {
          id: 'ev-103-2',
          dagId: '103',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-02',
          holdings: [{ personId: 'p-malek', share: '1/1' }],
        },
        {
          id: 'ev-103-3',
          dagId: '103',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-203',
          holdings: [{ personId: 'p-malek', share: '1/1' }],
        },
        {
          id: 'ev-103-4',
          dagId: '103',
          date: '2011-05-15',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-103',
          holdings: [{ personId: 'p-malek', share: '1/1' }],
        },
        {
          id: 'ev-103-5',
          dagId: '103',
          date: '2021-05-10',
          type: 'inheritance',
          deceasedId: 'p-malek',
          law: 'muslim',
          heirs: [
            { personId: 'p-rahima', relation: 'wife' },
            { personId: 'p-faruk', relation: 'son' },
            { personId: 'p-selim', relation: 'son' },
            { personId: 'p-nasima', relation: 'daughter' },
          ],
        },
        {
          id: 'ev-103-6',
          dagId: '103',
          date: '2021-09-18',
          type: 'mutation',
          caseNo: 'M-2021-103',
          refDeedNo: null,
          holdingsAfter: [
            { personId: 'p-rahima', share: '1/8' },
            { personId: 'p-faruk', share: '7/20' },
            { personId: 'p-selim', share: '7/20' },
            { personId: 'p-nasima', share: '7/40' },
          ],
        },
        {
          id: 'ev-103-7',
          dagId: '103',
          date: '2026-08-14',
          type: 'deed',
          deedNo: 'D-2026-103',
          kind: 'sale',
          sellers: [{ personId: 'p-faruk', share: '1/2' }],
          buyers: [{ personId: 'p-buyer-c', share: '1/2' }],
          declaredPriceBdt: 3622500,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-103-8',
          dagId: '103',
          date: '2026-03-12',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '104':
      return [
        {
          id: 'ev-104-1',
          dagId: '104',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-02',
          holdings: [{ personId: 'p-104-seller', share: '1/1' }],
        },
        {
          id: 'ev-104-2',
          dagId: '104',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-02',
          holdings: [{ personId: 'p-104-seller', share: '1/1' }],
        },
        {
          id: 'ev-104-3',
          dagId: '104',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-204',
          holdings: [{ personId: 'p-104-seller', share: '1/1' }],
        },
        {
          id: 'ev-104-4',
          dagId: '104',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-104',
          holdings: [{ personId: 'p-104-seller', share: '1/1' }],
        },
        {
          id: 'ev-104-5',
          dagId: '104',
          date: '2025-12-10',
          type: 'deed',
          deedNo: 'D-2025-104',
          kind: 'sale',
          sellers: [{ personId: 'p-104-seller', share: '1/1' }],
          buyers: [{ personId: 'p-104-buyer', share: '1/1' }],
          declaredPriceBdt: 11446750,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-104-6',
          dagId: '104',
          date: '2026-02-15',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '105':
      return [
        {
          id: 'ev-105-1',
          dagId: '105',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-03',
          holdings: [{ personId: 'p-105-a', share: '1/1' }],
        },
        {
          id: 'ev-105-2',
          dagId: '105',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-03',
          holdings: [{ personId: 'p-105-a', share: '1/1' }],
        },
        {
          id: 'ev-105-3',
          dagId: '105',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-205',
          holdings: [{ personId: 'p-105-a', share: '1/1' }],
        },
        {
          id: 'ev-105-4',
          dagId: '105',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-105',
          holdings: [{ personId: 'p-105-a', share: '1/1' }],
        },
        {
          id: 'ev-105-5',
          dagId: '105',
          date: '2026-02-10',
          type: 'deed',
          deedNo: 'D-2026-105A',
          kind: 'sale',
          sellers: [{ personId: 'p-105-a', share: '1/1' }],
          buyers: [{ personId: 'p-105-b', share: '1/1' }],
          declaredPriceBdt: 10879000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-105-6',
          dagId: '105',
          date: '2026-03-05',
          type: 'mutation',
          caseNo: 'M-2026-105A',
          refDeedNo: 'D-2026-105A',
          holdingsAfter: [{ personId: 'p-105-b', share: '1/1' }],
        },
        {
          id: 'ev-105-7',
          dagId: '105',
          date: '2026-04-15',
          type: 'deed',
          deedNo: 'D-2026-105B',
          kind: 'sale',
          sellers: [{ personId: 'p-105-b', share: '1/1' }],
          buyers: [{ personId: 'p-105-c', share: '1/1' }],
          declaredPriceBdt: 11200000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-105-8',
          dagId: '105',
          date: '2026-05-10',
          type: 'mutation',
          caseNo: 'M-2026-105B',
          refDeedNo: 'D-2026-105B',
          holdingsAfter: [{ personId: 'p-105-c', share: '1/1' }],
        },
        {
          id: 'ev-105-9',
          dagId: '105',
          date: '2026-06-20',
          type: 'deed',
          deedNo: 'D-2026-105C',
          kind: 'sale',
          sellers: [{ personId: 'p-105-c', share: '1/1' }],
          buyers: [{ personId: 'p-105-d', share: '1/1' }],
          declaredPriceBdt: 11500000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-105-10',
          dagId: '105',
          date: '2026-07-15',
          type: 'mutation',
          caseNo: 'M-2026-105C',
          refDeedNo: 'D-2026-105C',
          holdingsAfter: [{ personId: 'p-105-d', share: '1/1' }],
        },
        {
          id: 'ev-105-11',
          dagId: '105',
          date: '2026-02-01',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '106':
      return [
        {
          id: 'ev-106-1',
          dagId: '106',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-03',
          holdings: [{ personId: 'p-106-seller', share: '1/1' }],
        },
        {
          id: 'ev-106-2',
          dagId: '106',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-03',
          holdings: [{ personId: 'p-106-seller', share: '1/1' }],
        },
        {
          id: 'ev-106-3',
          dagId: '106',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-206',
          holdings: [{ personId: 'p-106-seller', share: '1/1' }],
        },
        {
          id: 'ev-106-4',
          dagId: '106',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-106',
          holdings: [{ personId: 'p-106-seller', share: '1/1' }],
        },
        {
          id: 'ev-106-5',
          dagId: '106',
          date: '2026-05-18',
          type: 'deed',
          deedNo: 'D-2026-106',
          kind: 'sale',
          sellers: [{ personId: 'p-106-seller', share: '1/1' }],
          buyers: [{ personId: 'p-106-buyer', share: '1/1' }],
          declaredPriceBdt: 3360000, // 28 dec * 120,000 (area value ~430,000*1.15 = 494,500)
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-106-6',
          dagId: '106',
          date: '2026-06-25',
          type: 'mutation',
          caseNo: 'M-2026-106',
          refDeedNo: 'D-2026-106',
          holdingsAfter: [{ personId: 'p-106-buyer', share: '1/1' }],
        },
        {
          id: 'ev-106-7',
          dagId: '106',
          date: '2026-01-20',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '107':
      return [
        {
          id: 'ev-107-1',
          dagId: '107',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-04',
          holdings: [{ personId: 'p-hasan', share: '1/1' }],
        },
        {
          id: 'ev-107-2',
          dagId: '107',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-04',
          holdings: [{ personId: 'p-hasan', share: '1/1' }],
        },
        {
          id: 'ev-107-3',
          dagId: '107',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-207',
          holdings: [{ personId: 'p-hasan', share: '1/1' }],
        },
        {
          id: 'ev-107-4',
          dagId: '107',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-107',
          holdings: [{ personId: 'p-hasan', share: '1/1' }],
        },
        {
          id: 'ev-107-5',
          dagId: '107',
          date: '2026-04-10',
          type: 'deed',
          deedNo: 'D-2026-107',
          kind: 'sale',
          sellers: [{ personId: 'p-mizan', share: '1/1' }], // Mizan was never an owner
          buyers: [{ personId: 'p-buyer-e', share: '1/1' }],
          declaredPriceBdt: 8452500,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-107-6',
          dagId: '107',
          date: '2026-02-18',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '108':
      return [
        {
          id: 'ev-108-1',
          dagId: '108',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-04',
          holdings: [{ personId: 'p-govt', share: '1/1' }],
        },
        {
          id: 'ev-108-2',
          dagId: '108',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-04',
          holdings: [{ personId: 'p-govt', share: '1/1' }],
        },
        {
          id: 'ev-108-3',
          dagId: '108',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-208',
          holdings: [{ personId: 'p-govt', share: '1/1' }],
        },
        {
          id: 'ev-108-4',
          dagId: '108',
          date: '2011-06-15',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-108',
          holdings: [{ personId: 'p-govt', share: '1/1' }],
        },
        {
          id: 'ev-108-5',
          dagId: '108',
          date: '2026-02-22',
          type: 'deed',
          deedNo: 'D-2026-108',
          kind: 'sale',
          sellers: [{ personId: 'p-108-fake-seller', share: '1/1' }],
          buyers: [{ personId: 'p-108-victim', share: '1/1' }],
          declaredPriceBdt: 9660000,
          subRegistryBn: 'মানিকগঞ্জ সদর',
        },
        {
          id: 'ev-108-6',
          dagId: '108',
          date: '2026-01-10',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '109':
      return [
        {
          id: 'ev-109-1',
          dagId: '109',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-05',
          holdings: [{ personId: 'p-109-owner', share: '1/1' }],
        },
        {
          id: 'ev-109-2',
          dagId: '109',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-05',
          holdings: [{ personId: 'p-109-owner', share: '1/1' }],
        },
        {
          id: 'ev-109-3',
          dagId: '109',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-209',
          holdings: [{ personId: 'p-109-owner', share: '1/1' }],
        },
        {
          id: 'ev-109-4',
          dagId: '109',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-109',
          holdings: [{ personId: 'p-109-owner', share: '1/1' }],
        },
        {
          id: 'ev-109-5',
          dagId: '109',
          date: '2025-11-14',
          type: 'case',
          caseNo: 'CS-2025-42',
          courtBn: 'যুগ্ম জেলা জজ ১ম আদালত, মানিকগঞ্জ',
          status: 'pending',
        },
        {
          id: 'ev-109-6',
          dagId: '109',
          date: '2026-01-15',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '110':
      return [
        {
          id: 'ev-110-1',
          dagId: '110',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-05',
          holdings: [{ personId: 'p-110-deceased', share: '1/1' }],
        },
        {
          id: 'ev-110-2',
          dagId: '110',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-05',
          holdings: [{ personId: 'p-110-deceased', share: '1/1' }],
        },
        {
          id: 'ev-110-3',
          dagId: '110',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-210',
          holdings: [{ personId: 'p-110-deceased', share: '1/1' }],
        },
        {
          id: 'ev-110-4',
          dagId: '110',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-110',
          holdings: [{ personId: 'p-110-deceased', share: '1/1' }],
        },
        {
          id: 'ev-110-5',
          dagId: '110',
          date: '2023-03-12',
          type: 'inheritance',
          deceasedId: 'p-110-deceased',
          law: 'muslim',
          heirs: [
            { personId: 'p-110-d1', relation: 'daughter' },
            { personId: 'p-110-d2', relation: 'daughter' },
            { personId: 'p-110-b1', relation: 'brother' },
          ],
        },
        {
          id: 'ev-110-6',
          dagId: '110',
          date: '2026-02-20',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '111':
      return [
        {
          id: 'ev-111-1',
          dagId: '111',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-06',
          holdings: [{ personId: 'p-111-original', share: '1/1' }],
        },
        {
          id: 'ev-111-2',
          dagId: '111',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-06',
          holdings: [{ personId: 'p-111-original', share: '1/1' }],
        },
        {
          id: 'ev-111-3',
          dagId: '111',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-211',
          holdings: [{ personId: 'p-111-original', share: '1/1' }],
        },
        {
          id: 'ev-111-4',
          dagId: '111',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-111',
          holdings: [{ personId: 'p-111-original', share: '1/1' }],
        },
        {
          id: 'ev-111-5',
          dagId: '111',
          date: '2025-06-18',
          type: 'mutation',
          caseNo: 'M-2025-111',
          refDeedNo: 'D-NONEXISTENT-9999',
          holdingsAfter: [{ personId: 'p-kamal', share: '1/1' }],
        },
        {
          id: 'ev-111-6',
          dagId: '111',
          date: '2026-03-01',
          type: 'landTax',
          paidUpToYear: 2026,
          arrearsBdt: 0,
        },
      ];

    case '112':
      return [
        {
          id: 'ev-112-1',
          dagId: '112',
          date: '1932-03-15',
          type: 'record',
          survey: 'CS',
          khatianNo: 'CS-06',
          holdings: [{ personId: 'p-112-owner', share: '1/1' }],
        },
        {
          id: 'ev-112-2',
          dagId: '112',
          date: '1962-05-20',
          type: 'record',
          survey: 'SA',
          khatianNo: 'SA-06',
          holdings: [{ personId: 'p-112-owner', share: '1/1' }],
        },
        {
          id: 'ev-112-3',
          dagId: '112',
          date: '1987-10-10',
          type: 'record',
          survey: 'RS',
          khatianNo: 'RS-212',
          holdings: [{ personId: 'p-112-owner', share: '1/1' }],
        },
        {
          id: 'ev-112-4',
          dagId: '112',
          date: '2011-04-10',
          type: 'record',
          survey: 'BS',
          khatianNo: 'BS-112',
          holdings: [{ personId: 'p-112-owner', share: '1/1' }],
        },
        {
          id: 'ev-112-5',
          dagId: '112',
          date: '2026-02-25',
          type: 'landTax',
          paidUpToYear: 2022,
          arrearsBdt: 18500,
        },
      ];

    default:
      return [];
  }
}
