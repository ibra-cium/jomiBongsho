import { create } from 'zustand';
import type { DemoData } from '@/engine/types';
import { loadDemoData } from './loadData';

interface DataState {
  data: DemoData | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<DemoData | null>;
}

export const useDataStore = create<DataState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  loadData: async () => {
    const current = get().data;
    if (current) return current;

    set({ isLoading: true, error: null });
    try {
      const data = await loadDemoData();
      set({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      set({ isLoading: false, error: message });
      return null;
    }
  },
}));
