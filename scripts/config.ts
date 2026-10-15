/**
 * Synthetic Demo Mouza Configuration
 * Constants and reference values matching DATA.md §1, §4, §5
 */
import type { LandClass } from '../src/engine/types';

export const SEED = 'jomi-bongsho-2026';
export const DEMO_TODAY = '2026-10-01'; // The engine's "today" for all date rules
export const MOUZA_CENTER: [number, number] = [90.05, 23.87]; // [lng, lat]
export const GRID = { cols: 8, rows: 6, cellMeters: 40, jitterMeters: 6 };

export const BASE_PRICES_2026: Record<LandClass, number> = {
  bastu: 520000,
  vita: 430000,
  nal: 210000,
  doba: 120000,
};

// Common generic Bangladeshi first names and surnames (Bangla and English)
export const MALE_FIRST_NAMES = [
  { bn: 'আব্দুল', en: 'Abdul' },
  { bn: 'মোহাম্মদ', en: 'Mohammad' },
  { bn: 'রফিকুল', en: 'Rafiqul' },
  { bn: 'শফিকুল', en: 'Shafiqul' },
  { bn: 'তারেক', en: 'Tarek' },
  { bn: 'রাশেদ', en: 'Rashed' },
  { bn: 'জহির', en: 'Zahir' },
  { bn: 'কবির', en: 'Kabir' },
  { bn: 'সেলিম', en: 'Selim' },
  { bn: 'ফারুক', en: 'Faruk' },
  { bn: 'আনোয়ার', en: 'Anwar' },
  { bn: 'হাসান', en: 'Hasan' },
  { bn: 'হাবিব', en: 'Habib' },
  { bn: 'ফজলুল', en: 'Fazlul' },
  { bn: 'নাজমুল', en: 'Nazmul' },
  { bn: 'কামরুল', en: 'Kamrul' },
  { bn: 'সোহেল', en: 'Sohel' },
  { bn: 'মোস্তফা', en: 'Mostafa' },
  { bn: 'আরিফ', en: 'Arif' },
  { bn: 'মিজান', en: 'Mizan' },
  { bn: 'জালাল', en: 'Jalal' },
  { bn: 'করিম', en: 'Karim' },
  { bn: 'রহিম', en: 'Rahim' },
  { bn: 'বাবুল', en: 'Babul' },
  { bn: 'নাসির', en: 'Nasir' },
  { bn: 'খলিল', en: 'Khalil' },
  { bn: 'আলাউদ্দিন', en: 'Alauddin' },
  { bn: 'মাহবুব', en: 'Mahbub' },
  { bn: 'শাহিন', en: 'Shahin' },
  { bn: 'ইমরান', en: 'Imran' },
  { bn: 'লতিফ', en: 'Latif' },
  { bn: 'মতিউর', en: 'Motiur' },
  { bn: 'মানিক', en: 'Manik' },
  { bn: 'স্বপন', en: 'Swapan' },
  { bn: 'সিরাজ', en: 'Siraj' },
  { bn: 'বেলাল', en: 'Belal' },
  { bn: 'হারুন', en: 'Harun' },
  { bn: 'মাসুদ', en: 'Masud' },
  { bn: 'কামাল', en: 'Kamal' },
  { bn: 'জাহিদ', en: 'Zahid' },
];

export const FEMALE_FIRST_NAMES = [
  { bn: 'ফাতেমা', en: 'Fatema' },
  { bn: 'রহিমা', en: 'Rahima' },
  { bn: 'রোকেয়া', en: 'Rokeya' },
  { bn: 'নাসিমা', en: 'Nasima' },
  { bn: 'পারভীন', en: 'Parveen' },
  { bn: 'সালমা', en: 'Salma' },
  { bn: 'শিরিন', en: 'Shirin' },
  { bn: 'জাহানারা', en: 'Jahanara' },
  { bn: 'রাবেয়া', en: 'Rabeya' },
  { bn: 'মরিয়ম', en: 'Marium' },
  { bn: 'রেহানা', en: 'Rehana' },
  { bn: 'কুলসুম', en: 'Kulsum' },
  { bn: 'খাদিজা', en: 'Khadija' },
  { bn: 'শাহানাজ', en: 'Shahanaz' },
  { bn: 'তাসলিমা', en: 'Taslima' },
  { bn: 'হাসিনা', en: 'Hasina' },
  { bn: 'লায়লা', en: 'Laila' },
  { bn: 'সুফিয়া', en: 'Sufia' },
  { bn: 'ফরিদা', en: 'Farida' },
  { bn: 'নুরজাহান', en: 'Nurjahan' },
  { bn: 'আমেনা', en: 'Amena' },
  { bn: 'আনোয়ারা', en: 'Anowara' },
  { bn: 'মনোয়ারা', en: 'Monowara' },
  { bn: 'সাবিনা', en: 'Sabina' },
  { bn: 'নাজনীন', en: 'Nazneen' },
  { bn: 'হেলেনা', en: 'Helena' },
  { bn: 'জাকিয়া', en: 'Zakia' },
  { bn: 'দিলরুবা', en: 'Dilruba' },
  { bn: 'রুমানা', en: 'Rumana' },
  { bn: 'শাহিনুর', en: 'Shahinur' },
];

export const SURNAMES = [
  { bn: 'মিয়া', en: 'Mia' },
  { bn: 'হোসেন', en: 'Hossain' },
  { bn: 'আলী', en: 'Ali' },
  { bn: 'আহমেদ', en: 'Ahmed' },
  { bn: 'শেখ', en: 'Sheikh' },
  { bn: 'চৌধুরী', en: 'Chowdhury' },
  { bn: 'খান', en: 'Khan' },
  { bn: 'শিকদার', en: 'Sikder' },
  { bn: 'হাওলাদার', en: 'Howlader' },
  { bn: 'মণ্ডল', en: 'Mondal' },
  { bn: 'কাজী', en: 'Kazi' },
  { bn: 'তালুকদার', en: 'Talukder' },
  { bn: 'বেপারি', en: 'Bepari' },
  { bn: 'সরকার', en: 'Sarker' },
  { bn: 'আকন্দ', en: 'Akand' },
  { bn: 'ভূঁইয়া', en: 'Bhuiyan' },
  { bn: 'মোল্লা', en: 'Mollah' },
  { bn: 'গাজী', en: 'Gazi' },
  { bn: 'মজুমদার', en: 'Majumder' },
  { bn: 'ইসলাম', en: 'Islam' },
  { bn: 'রহমান', en: 'Rahman' },
];
