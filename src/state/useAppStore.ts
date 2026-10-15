import { create } from 'zustand';
import { storage } from '@/lib/storage';

export type SupportedLang = 'bn' | 'en';
export type AppTheme = 'system' | 'light' | 'dark';
export type SheetSnap = 'peek' | 'half' | 'full';

interface DemoFlags {
  simulatedLocation: boolean;
  tamperMode: boolean;
}

interface AppState {
  lang: SupportedLang;
  theme: AppTheme;
  selectedDagId: string | null;
  sheetSnap: SheetSnap;
  sheetOpacity: number;
  demo: DemoFlags;
  showRiskColors: boolean;

  // Actions
  setLang: (lang: SupportedLang) => void;
  setTheme: (theme: AppTheme) => void;
  setSelectedDagId: (dagId: string | null) => void;
  setSheetSnap: (snap: SheetSnap) => void;
  setSheetOpacity: (opacity: number) => void;
  setShowRiskColors: (show: boolean) => void;
  setDemoFlags: (flags: Partial<DemoFlags>) => void;
}

const STORAGE_KEY_LANG = 'jb_lang';
const STORAGE_KEY_THEME = 'jb_theme';

const initialLang: SupportedLang = storage.get<SupportedLang>(STORAGE_KEY_LANG, 'bn');
const initialTheme: AppTheme = storage.get<AppTheme>(STORAGE_KEY_THEME, 'light');

// Synchronize document language and theme immediately
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
  if (initialTheme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', initialTheme);
  }
}

export const useAppStore = create<AppState>((set) => ({
  lang: initialLang,
  theme: initialTheme,
  selectedDagId: null,
  sheetSnap: 'peek',
  sheetOpacity: 0.85,
  demo: {
    simulatedLocation: false,
    tamperMode: false,
  },
  showRiskColors: false,

  setLang: (lang) => {
    storage.set(STORAGE_KEY_LANG, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ lang });
  },

  setTheme: (theme) => {
    storage.set(STORAGE_KEY_THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
    set({ theme });
  },

  setSelectedDagId: (selectedDagId) => set({ selectedDagId }),
  setSheetSnap: (sheetSnap) => set({ sheetSnap }),
  setSheetOpacity: (sheetOpacity) => set({ sheetOpacity }),
  setShowRiskColors: (showRiskColors) => set({ showRiskColors }),
  setDemoFlags: (flags) =>
    set((state) => ({
      demo: { ...state.demo, ...flags },
    })),
}));
